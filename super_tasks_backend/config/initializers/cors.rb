origins_env = ENV['FRONTEND_ORIGINS'].presence || ENV['FRONTEND_ORIGIN'].to_s

ALLOWED_ORIGINS = origins_env
  .split(/[,\s]+/)
  .map(&:strip)
  .reject(&:blank?)
  .freeze

if ALLOWED_ORIGINS.any?
  Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
      origins(*ALLOWED_ORIGINS)
      resource '*',
        headers: :any,
        expose: ['X-CSRF-Token'],
        methods: %i[get post put patch delete options head],
        credentials: true,
        max_age: 86_400
    end
  end
  Rails.logger.info("[CORS] Allowed origins: #{ALLOWED_ORIGINS.join(', ')}")
else
  Rails.logger.warn('[CORS] FRONTEND_ORIGINS/FRONTEND_ORIGIN が未設定のため、CORS設定をスキップします')
end
