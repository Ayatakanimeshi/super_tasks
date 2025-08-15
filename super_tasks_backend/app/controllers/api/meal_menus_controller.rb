class Api::MealMenusController < ApplicationController

  def index
    render json: MealMenu.order(created_at: :desc)
  end

  def show
    render json: MealMenu.find(params[:id])
  end

  def create
    menu = MealMenu.new(menu_params)
    if menu.save
      render json: menu, status: :created
    else
      render json: { ok: false, errors: menu.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    menu = MealMenu.find(params[:id])
    if menu.update(menu_params)
      render json: menu
    else
      render json: { ok: false, errors: menu.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    MealMenu.find(params[:id]).destroy!
    head :no_content
  end

  private

  def menu_params
    params.require(:meal_menu).permit(:name, :time_category, :food_category, :calories)
  end
end
