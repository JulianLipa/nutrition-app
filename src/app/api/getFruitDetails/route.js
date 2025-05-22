import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const fruitName = searchParams.get("fruit_name");

  if (!fruitName) {
    return NextResponse.json(
      { error: "Missing fruit_name parameter" },
      { status: 400 }
    );
  }

  try {
    const searchRes = await axios.get(
      `https://api.spoonacular.com/food/ingredients/search`,
      {
        params: {
          query: fruitName,
          apiKey: process.env.API_KEY_SPOONACULAR,
        },
      }
    );

    const ingredients = searchRes.data.results;
    if (ingredients.length === 0) {
      return NextResponse.json(
        { error: "No ingredients found" },
        { status: 404 }
      );
    }

    const firstIngredient = ingredients[0];
    const ingredientId = firstIngredient.id;

    const infoRes = await axios.get(
      `https://api.spoonacular.com/food/ingredients/${ingredientId}/information`,
      {
        params: {
          amount: 1,
          unit: "piece",
          apiKey: process.env.API_KEY_SPOONACULAR,
        },
      }
    );

    const { nutrition } = infoRes.data;
    const { nutrients = [] } = nutrition;

    const getNutrient = (name) =>
      nutrients.find((n) => n.name.toLowerCase().includes(name.toLowerCase()));

    const calories = getNutrient("calories");
    const protein = getNutrient("protein");
    const fat = getNutrient("fat");
    const carbs = getNutrient("carbohydrate");

    return NextResponse.json({
      ingredient: firstIngredient.name,
      image: `https://spoonacular.com/cdn/ingredients_250x250/${firstIngredient.image}`,
      nutrition: {
        calories: calories?.amount,
        protein: protein?.amount,
        fat: fat?.amount,
        carbs: carbs?.amount,
        unit: calories?.unit || "g",
      },
    });
  } catch (error) {
    console.error(
      "Error fetching data:",
      error.response?.data || error.message
    );

    return NextResponse.json(
      { error: error.response?.data?.message || "Something went wrong" },
      { status: error.response?.status || 500 }
    );
  }
}
