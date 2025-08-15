class Api::StudyLogsController < ApplicationController
  def index
    logs = current_user.study_logs.includes(:study_goal)

    if params[:from].present?
      from = Date.parse(params[:from]).beginning_of_day
      logs = logs.where('study_date >= ?', from)
    end
    if params[:to].present?
      to = Date.parse(params[:to]).end_of_day
      logs = logs.where('study_date <= ?', to)
    end

    render json: logs.order(study_date: :desc, created_at: :desc)
  end

  def create
    # goal が自分のものか検証（他人のgoalなら404）
    goal = current_user.study_goals.find(study_log_params[:study_goal_id])
    log  = current_user.study_logs.new(study_log_params.merge(study_goal_id: goal.id))

    if log.save
      render json: log, status: :created
    else
      render json: { ok: false, errors: log.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    log = current_user.study_logs.find(params[:id])
    if study_log_params[:study_goal_id].present?
      # 目標の付け替えが要求された場合も、自分のgoalのみ許可
      current_user.study_goals.find(study_log_params[:study_goal_id])
    end

    if log.update(study_log_params)
      render json: log
    else
      render json: { ok: false, errors: log.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    current_user.study_logs.find(params[:id]).destroy!
    head :no_content
  end

  private

  def study_log_params
    # hours: Float, study_date: datetime
    params.require(:study_log).permit(:study_goal_id, :hours, :study_date)
  end
end
