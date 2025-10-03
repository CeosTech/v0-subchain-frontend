# Spécifications des vues Django REST Framework pour SubChain

"""
# serializers.py

from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, SubscriptionPlan, Subscriber, Payment, Webhook, APIKey

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'wallet_address', 
                 'plan_tier', 'is_active', 'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm', 'first_name', 
                 'last_name', 'wallet_address']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password')
        
        return attrs

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'
        read_only_fields = ['id', 'user', 'subscriber_count', 'total_revenue', 
                           'created_at', 'updated_at']

class SubscriberSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    plan_amount = serializers.DecimalField(source='plan.amount', max_digits=10, 
                                          decimal_places=6, read_only=True)
    plan_currency = serializers.CharField(source='plan.currency', read_only=True)

    class Meta:
        model = Subscriber
        fields = '__all__'
        read_only_fields = ['id', 'total_paid', 'created_at', 'updated_at']

class PaymentSerializer(serializers.ModelSerializer):
    subscriber_wallet = serializers.CharField(source='subscriber.wallet_address', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class WebhookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Webhook
        fields = '__all__'
        read_only_fields = ['id', 'user', 'secret', 'last_triggered', 
                           'failure_count', 'created_at', 'updated_at']

class APIKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = ['id', 'name', 'key', 'is_active', 'last_used', 
                 'created_at', 'expires_at']
        read_only_fields = ['id', 'key', 'last_used', 'created_at']
"""

"""
# views.py

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import timedelta
from .models import User, SubscriptionPlan, Subscriber, Payment, Webhook, APIKey
from .serializers import *

# Authentication Views
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

# Plan Views
class PlanListCreateView(generics.ListCreateAPIView):
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = SubscriptionPlan.objects.filter(user=self.request.user)
        status_filter = self.request.query_params.get('status')
        search = self.request.query_params.get('search')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SubscriptionPlan.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def activate_plan(request, pk):
    try:
        plan = SubscriptionPlan.objects.get(pk=pk, user=request.user)
        plan.status = 'active'
        plan.save()
        return Response(SubscriptionPlanSerializer(plan).data)
    except SubscriptionPlan.DoesNotExist:
        return Response({'error': 'Plan not found'}, status=404)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def deactivate_plan(request, pk):
    try:
        plan = SubscriptionPlan.objects.get(pk=pk, user=request.user)
        plan.status = 'inactive'
        plan.save()
        return Response(SubscriptionPlanSerializer(plan).data)
    except SubscriptionPlan.DoesNotExist:
        return Response({'error': 'Plan not found'}, status=404)

# Subscriber Views
class SubscriberListCreateView(generics.ListCreateAPIView):
    serializer_class = SubscriberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_plans = SubscriptionPlan.objects.filter(user=self.request.user)
        queryset = Subscriber.objects.filter(plan__in=user_plans)
        
        status_filter = self.request.query_params.get('status')
        plan_filter = self.request.query_params.get('plan')
        search = self.request.query_params.get('search')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if plan_filter:
            queryset = queryset.filter(plan=plan_filter)
        if search:
            queryset = queryset.filter(
                Q(wallet_address__icontains=search) | Q(email__icontains=search)
            )
        
        return queryset

    def perform_create(self, serializer):
        plan = serializer.validated_data['plan']
        if plan.user != self.request.user:
            raise serializers.ValidationError("Plan not found")
        
        subscriber = serializer.save()
        
        # Update plan statistics
        plan.subscriber_count += 1
        plan.save()

class SubscriberDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SubscriberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_plans = SubscriptionPlan.objects.filter(user=self.request.user)
        return Subscriber.objects.filter(plan__in=user_plans)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_subscriber(request, pk):
    try:
        user_plans = SubscriptionPlan.objects.filter(user=request.user)
        subscriber = Subscriber.objects.get(pk=pk, plan__in=user_plans)
        subscriber.status = 'cancelled'
        subscriber.save()
        
        # Update plan statistics
        subscriber.plan.subscriber_count = max(0, subscriber.plan.subscriber_count - 1)
        subscriber.plan.save()
        
        return Response(SubscriberSerializer(subscriber).data)
    except Subscriber.DoesNotExist:
        return Response({'error': 'Subscriber not found'}, status=404)

# Analytics Views
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def analytics_overview(request):
    user_plans = SubscriptionPlan.objects.filter(user=request.user)
    subscribers = Subscriber.objects.filter(plan__in=user_plans)
    payments = Payment.objects.filter(plan__in=user_plans, status='completed')
    
    # Basic metrics
    total_subscribers = subscribers.count()
    active_subscribers = subscribers.filter(status='active').count()
    cancelled_subscribers = subscribers.filter(status='cancelled').count()
    paused_subscribers = subscribers.filter(status='paused').count()
    
    # Revenue metrics
    total_revenue = payments.aggregate(Sum('amount'))['amount__sum'] or 0
    
    # MRR calculation (simplified)
    monthly_plans = user_plans.filter(interval='monthly')
    yearly_plans = user_plans.filter(interval='yearly')
    
    mrr = 0
    for plan in monthly_plans:
        active_subs = subscribers.filter(plan=plan, status='active').count()
        mrr += active_subs * plan.amount
    
    for plan in yearly_plans:
        active_subs = subscribers.filter(plan=plan, status='active').count()
        mrr += active_subs * (plan.amount / 12)
    
    arr = mrr * 12
    
    # Churn rate (simplified - last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    churned_last_month = subscribers.filter(
        status='cancelled',
        updated_at__gte=thirty_days_ago
    ).count()
    
    churn_rate = (churned_last_month / max(total_subscribers, 1)) * 100
    
    # ARPU
    arpu = total_revenue / max(active_subscribers, 1)
    
    return Response({
        'total_subscribers': total_subscribers,
        'active_subscribers': active_subscribers,
        'cancelled_subscribers': cancelled_subscribers,
        'paused_subscribers': paused_subscribers,
        'mrr': float(mrr),
        'arr': float(arr),
        'churn_rate': churn_rate,
        'total_revenue': float(total_revenue),
        'average_revenue_per_user': float(arpu),
        'growth_rate': 0,  # Implement based on historical data
    })

# Webhook Views
class WebhookListCreateView(generics.ListCreateAPIView):
    serializer_class = WebhookSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Webhook.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# API Key Views
class APIKeyListCreateView(generics.ListCreateAPIView):
    serializer_class = APIKeySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return APIKey.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
"""

"""
# urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.ProfileView.as_view(), name='profile'),
    
    # Plans
    path('plans/', views.PlanListCreateView.as_view(), name='plan-list'),
    path('plans/<uuid:pk>/', views.PlanDetailView.as_view(), name='plan-detail'),
    path('plans/<uuid:pk>/activate/', views.activate_plan, name='activate-plan'),
    path('plans/<uuid:pk>/deactivate/', views.deactivate_plan, name='deactivate-plan'),
    
    # Subscribers
    path('subscribers/', views.SubscriberListCreateView.as_view(), name='subscriber-list'),
    path('subscribers/<uuid:pk>/', views.SubscriberDetailView.as_view(), name='subscriber-detail'),
    path('subscribers/<uuid:pk>/cancel/', views.cancel_subscriber, name='cancel-subscriber'),
    
    # Analytics
    path('analytics/overview/', views.analytics_overview, name='analytics-overview'),
    
    # Webhooks
    path('webhooks/', views.WebhookListCreateView.as_view(), name='webhook-list'),
    
    # API Keys
    path('api-keys/', views.APIKeyListCreateView.as_view(), name='apikey-list'),
]
"""
