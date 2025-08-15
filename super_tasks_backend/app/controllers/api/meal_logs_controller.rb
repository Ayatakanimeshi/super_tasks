class Api::MealLogsController < ApplicationController
  def index
    logs = current_user.meal_logs.includes(:meal_menu)

    if params[:from].present?
      from = Date.parse(params[:from]).beginning_of_day
      logs = logs.where('meal_date >= ?', from)
    end

    if params[:to].present?
      to = Date.parse(params[:to]).end_of_day
      logs = logs.where('meal_date <= ?', to)
    end

    render json: logs.order(meal_date: :desc, created_at: :desc)
  end

  def create
    log = current_user.meal_logs.new(log_params)
    if log.save
      render json: log, status: :created
    else
      render json: { ok: false, errors: log.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    log = current_user.meal_logs.find(params[:id])
    if log.update(log_params)
      render json: log
    else
      render json: { ok: false, errors: log.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    current_user.meal_logs.find(params[:id]).destroy!
    head :no_content
  end

  private

  def log_params
    # meal_date は datetime カラム。ISO8601 文字列をそのまま渡せばOK（Railsがparse）
    params.require(:meal_log).permit(:meal_menu_id, :amount, :meal_date)
  end
end
