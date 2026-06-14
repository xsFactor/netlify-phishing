window.PhishGuard = {
  baseURL: '',
  token: null,
  debug: false,

  init: function(config) {
    this.baseURL = config.baseURL || '/api/v1'
    this.debug = config.debug || false
    
    const params = new URLSearchParams(window.location.search)
    this.token = params.get('token')
    
    if (!this.token) {
      console.warn('[PhishGuard] No tracking token found in URL')
      return
    }
    
    this.log('Initialized with token:', this.token)
    
    if (config.autoTrack !== false) {
      this.trackEvent('page_visited', {
        page: window.location.pathname,
        referrer: document.referrer
      })
    }
    
    this.trackFormSubmissions()
    this.trackLinkClicks()
  },

  trackEvent: function(eventType, eventData) {
    if (!this.token) {
        console.warn('[PhishGuard] No token set, skipping event')
        return
    }
  
    // Use GET request via image (pixel)
    const pixelUrl = this.baseURL + '/capture/pixel/' + this.token + '?event=' + encodeURIComponent(eventType)
    const img = new Image()
    img.src = pixelUrl
    img.style.display = 'none'
    document.body.appendChild(img)
  
    this.log('Event tracked:', eventType, eventData)
  },

  trackFormSubmissions: function() {
    const self = this
    document.addEventListener('submit', function(e) {
      const form = e.target
      self.trackEvent('form_submitted', { formId: form.id })
      
      const formData = new FormData(form)
      const data = {}
      for (let key of formData.keys()) {
        data[key] = true
      }
      
      if (data.email || data.password || data.username) {
        self.trackEvent('credentials_entered', {
          hasEmail: !!data.email,
          hasPassword: !!data.password
        })
      }
    })
    
    this.log('Form submission tracking enabled')
  },

  trackLinkClicks: function() {
    const self = this
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a')
      if (link && link.href) {
        self.trackEvent('link_clicked', { href: link.href })
      }
    })
    
    this.log('Link click tracking enabled')
  },

  log: function() {
    if (this.debug) {
      console.log('[PhishGuard]', arguments)
    }
  }
}
