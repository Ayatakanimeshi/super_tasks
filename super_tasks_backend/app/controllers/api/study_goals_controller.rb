class Api::StudyGoalsController < ApplicationController
  def index
    render json: current_user.study_goals.order(created_at: :desc)
  end

  def show
    goal = current_user.study_goals.find(params[:id])
    render json: goal
  end

  def create
    goal = current_user.study_goals.new(goal_params)
    if goal.save
      render json: goal, status: :created
    else
      render json: { ok: false, errors: goal.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    goal = current_user.study_goals.find(params[:id])
    if goal.update(goal_params)
      render json: goal
    else
      render json: { ok: false, errors: goal.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    current_user.study_goals.find(params[:id]).destroy!
    head :no_content
  end

  private

  def goal_params
    params.require(:study_goal).permit(:name, :description, :category, :target_hours, :completed)
  end
end
