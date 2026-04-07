import Groq from "groq-sdk";

const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const DEFAULT_MAX_SUGGESTIONS = Number(process.env.RECIPE_AI_MAX_SUGGESTIONS || 5);
const DEFAULT_TEMPERATURE = Number(process.env.RECIPE_AI_TEMPERATURE || 0.4);

const buildYouTubeSearchLink = (dishName, suffix = "recipe") => {
  const query = `${dishName} ${suffix}`.trim();
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
};

const parseModelJson = (rawText) => {
  if (!rawText) return null;

  const trimmed = rawText.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = fencedMatch ? fencedMatch[1].trim() : trimmed;

  return JSON.parse(jsonText);
};

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeSuggestions = (suggestions, limit) => {
  if (!Array.isArray(suggestions)) return [];

  return suggestions.slice(0, limit).map((item) => {
    const dishName = typeof item?.dishName === "string" && item.dishName.trim()
      ? item.dishName.trim()
      : "Suggested dish";

    const recipeIngredients = normalizeStringArray(item?.recipe?.ingredients);
    const recipeSteps = normalizeStringArray(item?.recipe?.steps);
    const youtubeLinks = normalizeStringArray(item?.youtubeLinks);

    return {
      dishName,
      whyItFits: typeof item?.whyItFits === "string" ? item.whyItFits.trim() : "",
      recipe: {
        ingredients: recipeIngredients,
        steps: recipeSteps
      },
      youtubeLinks: youtubeLinks.length
        ? youtubeLinks
        : [
            buildYouTubeSearchLink(dishName, "recipe"),
            buildYouTubeSearchLink(dishName, "easy recipe")
          ]
    };
  });
};

/**
 * Suggest dishes and recipes based on provided ingredients
 * @route POST /ai/recipes/suggest
 * @access Private
 */
export const suggestRecipesFromIngredients = async (req, res) => {
  try {
    const { ingredients, cuisine = "", diet = "", maxSuggestions } = req.body;

    const normalizedIngredients = normalizeStringArray(ingredients);
    if (!normalizedIngredients.length) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one ingredient"
      });
    }

    const safeLimit = Math.min(
      Math.max(Number(maxSuggestions || DEFAULT_MAX_SUGGESTIONS), 1),
      10
    );

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GROQ_API_KEY is not configured on the server"
      });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = [
      "You are a recipe assistant.",
      "Respond only in valid JSON.",
      "Do not include markdown or code fences.",
      "Return this exact JSON schema:",
      "{",
      "  \"suggestions\": [",
      "    {",
      "      \"dishName\": \"string\",",
      "      \"whyItFits\": \"string\",",
      "      \"recipe\": {",
      "        \"ingredients\": [\"string\"],",
      "        \"steps\": [\"string\"]",
      "      },",
      "      \"youtubeLinks\": [\"string\"]",
      "    }",
      "  ]",
      "}"
    ].join(" ");

    const userPrompt = [
      `Ingredients: ${normalizedIngredients.join(", ")}`,
      cuisine ? `Cuisine preference: ${cuisine}` : "",
      diet ? `Diet preference: ${diet}` : "",
      `Suggest exactly ${safeLimit} dishes using these ingredients as much as possible.`,
      "Keep steps practical and beginner friendly.",
      "If exact YouTube URLs are uncertain, provide best-effort links or video search links."
    ]
      .filter(Boolean)
      .join("\n");

    const completion = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: DEFAULT_TEMPERATURE,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    const content = completion?.choices?.[0]?.message?.content || "";
    const parsed = parseModelJson(content);
    const suggestions = normalizeSuggestions(parsed?.suggestions, safeLimit);

    if (!suggestions.length) {
      return res.status(502).json({
        success: false,
        message: "AI response could not be parsed. Please try again."
      });
    }

    return res.json({
      success: true,
      data: {
        ingredients: normalizedIngredients,
        cuisine,
        diet,
        suggestions
      }
    });
  } catch (err) {
    console.error("AI recipe suggestion error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to generate recipe suggestions"
    });
  }
};
