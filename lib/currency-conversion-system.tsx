// Système de conversion de devises en temps réel pour SubChain

export interface CurrencyRate {
  from: string
  to: string
  rate: number
  timestamp: number
  source: string
}

export interface PriceCalculation {
  basePriceEUR: number
  basePriceUSD: number
  currentAlgoPrice: number
  exchangeRates: {
    ALGO_EUR: number
    ALGO_USD: number
    EUR_USD: number
    USD_EUR: number
  }
  calculatedPrices: {
    algoFromEUR: number
    algoFromUSD: number
  }
  preferredCurrency: 'EUR' | 'USD'
  finalAlgoPrice: number
  lastUpdated: string
}

export class CurrencyService {
  private static instance: CurrencyService
  private rates: Map<string, CurrencyRate> = new Map()
  private updateInterval: NodeJS.Timeout | null = null
  private readonly API_ENDPOINTS = {
    COINGECKO: 'https://api.coingecko.com/api/v3/simple/price',
    EXCHANGERATE: 'https://api.exchangerate-api.com/v4/latest',
    FIXER: 'https://api.fixer.io/latest'
  }

  static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService()
    }
    return CurrencyService.instance
  }

  // Démarrer les mises à jour automatiques des taux
  startRealTimeUpdates(intervalMinutes: number = 5): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }

    this.updateInterval = setInterval(async () => {
      await this.updateAllRates()
    }, intervalMinutes * 60 * 1000)

    // Mise à jour initiale
    this.updateAllRates()
  }

  // Arrêter les mises à jour automatiques
  stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  // Mettre à jour tous les taux de change
  async updateAllRates(): Promise<void> {
    try {
      await Promise.all([
        this.updateCryptoRates(),
        this.updateFiatRates()
      ])
      console.log('Currency rates updated successfully')
    } catch (error) {
      console.error('Failed to update currency rates:', error)
    }
  }

  // Mettre à jour les taux crypto (ALGO)
  private async updateCryptoRates(): Promise<void> {
    try {
      const response = await fetch(
        `${this.API_ENDPOINTS.COINGECKO}?ids=algorand&vs_currencies=eur,usd`
      )
      const data = await response.json()
      
      if (data.algorand) {
        this.setRate('ALGO', 'EUR', data.algorand.eur, 'coingecko')
        this.setRate('ALGO', 'USD', data.algorand.usd, 'coingecko')
      }
    } catch (error) {
      console.error('Failed to update crypto rates:', error)
    }
  }

  // Mettre à jour les taux fiat (EUR/USD)
  private async updateFiatRates(): Promise<void> {
    try {
      const response = await fetch(`${this.API_ENDPOINTS.EXCHANGERATE}/EUR`)
      const data = await response.json()
      
      if (data.rates && data.rates.USD) {
        this.setRate('EUR', 'USD', data.rates.USD, 'exchangerate-api')
        this.setRate('USD', 'EUR', 1 / data.rates.USD, 'exchangerate-api')
      }
    } catch (error) {
      console.error('Failed to update fiat rates:', error)
    }
  }

  // Définir un taux de change
  private setRate(from: string, to: string, rate: number, source: string): void {
    const key = `${from}_${to}`
    this.rates.set(key, {
      from,
      to,
      rate,
      timestamp: Date.now(),
      source
    })
  }

  // Obtenir un taux de change
  getRate(from: string, to: string): CurrencyRate | null {
    const key = `${from}_${to}`
    return this.rates.get(key) || null
  }

  // Calculer le prix en ALGO basé sur le prix fiat
  calculateAlgoPrice(
    basePriceEUR: number,
    basePriceUSD: number,
    preferredCurrency: 'EUR' | 'USD'
  ): PriceCalculation {
    const algoEurRate = this.getRate('ALGO', 'EUR')
    const algoUsdRate = this.getRate('ALGO', 'USD')
    const eurUsdRate = this.getRate('EUR', 'USD')
    const usdEurRate = this.getRate('USD', 'EUR')

    if (!algoEurRate || !algoUsdRate || !eurUsdRate || !usdEurRate) {
      throw new Error('Currency rates not available')
    }

    // Calculer les prix ALGO pour chaque devise
    const algoFromEUR = basePriceEUR / algoEurRate.rate
    const algoFromUSD = basePriceUSD / algoUsdRate.rate

    // Choisir le prix final basé sur la devise préférée
    const finalAlgoPrice = preferredCurrency === 'EUR' ? algoFromEUR : algoFromUSD

    return {
      basePriceEUR,
      basePriceUSD,
      currentAlgoPrice: finalAlgoPrice,
      exchangeRates: {
        ALGO_EUR: algoEurRate.rate,
        ALGO_USD: algoUsdRate.rate,
        EUR_USD: eurUsdRate.rate,
        USD_EUR: usdEurRate.rate
      },
      calculatedPrices: {
        algoFromEUR,
        algoFromUSD
      },
      preferredCurrency,
      finalAlgoPrice,
      lastUpdated: new Date().toISOString()
    }
  }

  // Vérifier si les taux doivent être mis à jour
  shouldUpdatePricing(
    lastUpdate: Date,
    currentAlgoPrice: number,
    newAlgoPrice: number,
    threshold: number = 5.0
  ): boolean {
    // Vérifier l'âge de la dernière mise à jour (plus de 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
    if (lastUpdate < tenMinutesAgo) {
      return true
    }

    // Vérifier le seuil de changement de prix
    const priceChangePercent = Math.abs((newAlgoPrice - currentAlgoPrice) / currentAlgoPrice) * 100
    return priceChangePercent >= threshold
  }

  // Convertir une devise vers une autre
  convert(amount: number, from: string, to: string): number {
    if (from === to) return amount

    const rate = this.getRate(from, to)
    if (!rate) {
      throw new Error(`Exchange rate not found for ${from} to ${to}`)
    }

    return amount * rate.rate
  }

  // Obtenir tous les taux actuels
  getAllRates(): CurrencyRate[] {
    return Array.from(this.rates.values())
  }

  // Obtenir l'historique des taux (simulation)
  async getRateHistory(
    from: string,
    to: string,
    days: number = 30
  ): Promise<Array<{ date: string; rate: number }>> {
    // Dans un vrai système, ceci viendrait d'une base de données
    const currentRate = this.getRate(from, to)
    if (!currentRate) return []

    const history = []
    for (let i = days; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      // Simulation de variation de ±5%
      const variation = (Math.random() - 0.5) * 0.1
      const rate = currentRate.rate * (1 + variation)
      
      history.push({
        date: date.toISOString().split('T')[0],
        rate: parseFloat(rate.toFixed(6))
      })
    }

    return history
  }

  // Créer une alerte de taux
  createRateAlert(
    from: string,
    to: string,
    targetRate: number,
    condition: 'above' | 'below'
  ): string {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Dans un vrai système, ceci serait stocké en base de données
    console.log(`Rate alert created: ${alertId}`, {
      from,
      to,
      targetRate,
      condition
    })

    return alertId
  }
}

// Hook React pour utiliser le service de devises
export function useCurrencyService() {
  const [rates, setRates] = useState<CurrencyRate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currencyService = CurrencyService.getInstance()

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    const initializeService = async () => {
      try {
        setLoading(true)
        await currencyService.updateAllRates()
        setRates(currencyService.getAllRates())

        // Démarrer les mises à jour automatiques toutes les 5 minutes
        currencyService.startRealTimeUpdates(5)

        // Mettre à jour l'état local toutes les minutes
        interval = setInterval(() => {
          setRates(currencyService.getAllRates())
        }, 60000)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize currency service")
      } finally {
        setLoading(false)
      }
    }

    void initializeService()

    return () => {
      if (interval) {
        clearInterval(interval)
      }
      currencyService.stopRealTimeUpdates()
    }
  }, [currencyService])

  const calculatePrice = useCallback((
    basePriceEUR: number,
    basePriceUSD: number,
    preferredCurrency: 'EUR' | 'USD'
  ) => {
    try {
      return currencyService.calculateAlgoPrice(basePriceEUR, basePriceUSD, preferredCurrency)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate price')
      return null
    }
  }, [currencyService])

  const convert = useCallback((amount: number, from: string, to: string) => {
    try {
      return currencyService.convert(amount, from, to)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert currency')
      return null
    }
  }, [currencyService])

  const getRate = useCallback((from: string, to: string) => {
    return currencyService.getRate(from, to)
  }, [currencyService])

  return {
    rates,
    loading,
    error,
    calculatePrice,
    convert,
    getRate,
    updateRates: () => currencyService.updateAllRates(),
    getRateHistory: currencyService.getRateHistory.bind(currencyService),
    createRateAlert: currencyService.createRateAlert.bind(currencyService)
  }
}

// Composant React pour afficher les taux en temps réel
export function CurrencyRatesDisplay() {
  const { rates, loading, error } = useCurrencyService()

  if (loading) {
    return <div className="animate-pulse">Chargement des taux...</div>
  }

  if (error) {
    return <div className="text-red-600">Erreur: {error}</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {rates.map((rate) => (
        <div key={`${rate.from}_${rate.to}`} className="p-4 border rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">
              {rate.from} → {rate.to}
            </span>
            <span className="text-sm text-muted-foreground">
              {rate.source}
            </span>
          </div>
          <div className="text-2xl font-bold">
            {rate.rate.toFixed(rate.to === 'ALGO' ? 6 : 4)}
          </div>
          <div className="text-xs text-muted-foreground">
            Mis à jour: {new Date(rate.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  )
}
