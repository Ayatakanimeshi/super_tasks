class Api::TrainingLogsController < ApplicationController
  def index
    logs = current_user.training_logs.includes(:training_menu)

    if params[:from].present?
      from = Date.parse(params[:from]).beginning_of_day
      logs = logs.where('performed_at >= ?', from)
    end

    if params[:to].present?
      to = Date.parse(params[:to]).end_of_day
      logs = logs.where('performed_at <= ?', to)
    end

    render json: logs.order(performed_at: :desc, created_at: :desc)
  end

  def create
    log = current_user.training_logs.new(log_params)
    if log.save
      render json: log, status: :created
    else
      render json: { ok: false, errors: log.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    log = current_user.training_logs.find(params[:id])
    if log.update(log_params)
      render json: log
    else
      render json: { ok: false, errors: log.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    current_user.training_logs.find(params[:id]).destroy!
    head :no_content
  end

  private

  def log_params
    params.require(:training_log).permit(:training_menu_id, :weight, :reps, :performed_at, :duration_minutes)
  end
end
