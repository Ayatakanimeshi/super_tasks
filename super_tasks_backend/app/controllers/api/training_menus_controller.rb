class Api::TrainingMenusController < ApplicationController
  def index
    menus = TrainingMenu.all.order(created_at: :desc)
    render json: menus
  end

  def show
    menu = TrainingMenu.find(params[:id])
    render json: menu
  end

  def create
    menu = TrainingMenu.new(menu_params)
    if menu.save
      render json: menu, status: :created
    else
      render json: { ok: false, errors: menu.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    menu = TrainingMenu.find(params[:id])
    if menu.update(menu_params)
      render json: menu
    else
      render json: { ok: false, errors: menu.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    TrainingMenu.find(params[:id]).destroy!
    head :no_content
  end

  private

  def menu_params
    params.require(:training_menu).permit(:name, :category)
  end
end
