class Api::MentorTaskLogsController < ApplicationController
  def index
    logs = current_user.mentor_task_logs.includes(:mentor_task)

    # 期間フィルタ（deadline）
    if params[:from].present?
      from = Date.parse(params[:from]).beginning_of_day
      logs = logs.where('deadline >= ?', from)
    end
    if params[:to].present?
      to = Date.parse(params[:to]).end_of_day
      logs = logs.where('deadline <= ?', to)
    end

    # ステータス絞り込み
    case params[:status]
    when 'completed'
      logs = logs.where(completed: true)
    when 'pending'
      logs = logs.where(completed: false)
    end

    # 期限切れ絞り込み（未完了かつ締切過去）
    if ActiveModel::Type::Boolean.new.cast(params[:overdue])
      logs = logs.where(completed: false).where('deadline IS NOT NULL AND deadline < ?', Time.current)
    end

    results = logs.order(deadline: :asc, created_at: :desc).map { |log|
      log.as_json.merge(
        'overdue' => (!log.completed && log.deadline.present? && log.deadline < Time.current)
      )
    }

    render json: results
  end

  def create
    # 存在確認（他人のTaskでもログは付けられる設計：Taskが共通マスタのため）
    MentorTask.find(log_params[:mentor_task_id])

    log = current_user.mentor_task_logs.new(log_params)
    if log.save
      render json: log_with_overdue(log), status: :created
    else
      render json: { ok: false, errors: log.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    log = current_user.mentor_task_logs.find(params[:id])

    # taskの付け替えが来た場合は存在確認のみ
    if log_params[:mentor_task_id].present?
      MentorTask.find(log_params[:mentor_task_id])
    end

    if log.update(log_params)
      render json: log_with_overdue(log)
    else
      render json: { ok: false, errors: log.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    current_user.mentor_task_logs.find(params[:id]).destroy!
    head :no_content
  end

  private

  def log_params
    # executed_at / deadline は datetime
    params.require(:mentor_task_log).permit(:mentor_task_id, :executed_at, :deadline, :completed)
  end

  def log_with_overdue(log)
    log.as_json.merge(
      'overdue' => (!log.completed && log.deadline.present? && log.deadline < Time.current)
    )
  end
end
