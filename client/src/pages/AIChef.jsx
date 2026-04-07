import { useState } from 'react';
import { aiService } from '../services';

const AIChef = () => {
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [diet, setDiet] = useState('');
  const [maxSuggestions, setMaxSuggestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);

  const parseIngredients = (rawText) => {
    return rawText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsedIngredients = parseIngredients(ingredientsInput);
    if (!parsedIngredients.length) {
      setError('Please add at least one ingredient.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await aiService.suggestRecipes({
        ingredients: parsedIngredients,
        cuisine,
        diet,
        maxSuggestions: Number(maxSuggestions)
      });

      setResults(response?.data?.suggestions || []);
    } catch (err) {
      setError(err.message || 'Failed to generate AI recipe suggestions');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-warmGray-900 tracking-tight mb-2">
          AI Recipe Assistant
        </h1>
        <p className="text-warmGray-600">
          Tell me what ingredients you have, and I will suggest dishes, recipe steps, and YouTube links.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-5 md:p-6 border border-cream-300 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-warmGray-700 mb-2">Ingredients</label>
            <textarea
              value={ingredientsInput}
              onChange={(e) => setIngredientsInput(e.target.value)}
              placeholder="Example: tomato, onion, garlic, paneer, rice"
              rows={4}
              className="input min-h-[110px]"
            />
            <p className="text-xs text-warmGray-500 mt-2">Use commas to separate ingredients.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-warmGray-700 mb-2">Cuisine (optional)</label>
            <input
              type="text"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              placeholder="Indian, Italian, Mexican..."
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warmGray-700 mb-2">Diet (optional)</label>
            <input
              type="text"
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              placeholder="Vegetarian, high-protein..."
              className="input"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-warmGray-700 mb-2">Number of suggestions</label>
            <select
              value={maxSuggestions}
              onChange={(e) => setMaxSuggestions(e.target.value)}
              className="input"
            >
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary rounded-full px-6 disabled:opacity-60"
          >
            {loading ? 'Generating...' : 'Suggest Recipes'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIngredientsInput('');
              setCuisine('');
              setDiet('');
              setMaxSuggestions(5);
              setResults([]);
              setError('');
            }}
            className="btn-outline rounded-full px-6"
          >
            Reset
          </button>
        </div>
      </form>

      {error && (
        <div className="card bg-error-50 border border-error-200 text-error-700 px-5 py-4 mb-6">
          {error}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-4">
          {results.map((item, index) => (
            <article key={`${item.dishName}-${index}`} className="card p-5 border border-cream-300">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <h2 className="text-xl font-semibold text-warmGray-900">{item.dishName}</h2>
                <span className="text-xs px-3 py-1 rounded-full bg-primary-100 text-primary-800 font-medium">
                  Suggestion {index + 1}
                </span>
              </div>

              {item.whyItFits && (
                <p className="text-warmGray-700 mt-3">{item.whyItFits}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="font-semibold text-warmGray-800 mb-2">Ingredients</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-warmGray-700">
                    {(item.recipe?.ingredients || []).map((ingredient, ingredientIndex) => (
                      <li key={`${ingredient}-${ingredientIndex}`}>{ingredient}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-warmGray-800 mb-2">Steps</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-warmGray-700">
                    {(item.recipe?.steps || []).map((step, stepIndex) => (
                      <li key={`${step.slice(0, 24)}-${stepIndex}`}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold text-warmGray-800 mb-2">YouTube Links</h3>
                <div className="flex flex-wrap gap-2">
                  {(item.youtubeLinks || []).map((link, linkIndex) => (
                    <a
                      key={`${link}-${linkIndex}`}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-full bg-cream-100 text-warmGray-800 hover:bg-primary-100 hover:text-primary-800 transition-colors text-sm"
                    >
                      Watch #{linkIndex + 1}
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIChef;
