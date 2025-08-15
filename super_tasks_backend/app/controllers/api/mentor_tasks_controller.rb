class Api::MentorTasksController < ApplicationController
  def index
    tasks = MentorTask.order(created_at: :desc)
    render json: tasks
  end

  def show
    task = MentorTask.find(params[:id])
    render json: task
  end

  def create
    task = MentorTask.new(task_params)
    if task.save
      render json: task, status: :created
    else
      render json: { ok: false, errors: task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    task = MentorTask.find(params[:id])
    if task.update(task_params)
      render json: task
    else
      render json: { ok: false, errors: task.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    MentorTask.find(params[:id]).destroy!
    head :no_content
  end

  private

  def task_params
    params.require(:mentor_task).permit(:name, :description, :category)
  end
end
