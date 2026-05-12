/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Utensils, 
  Search, 
  Plus, 
  X, 
  Clock, 
  Flame, 
  ShoppingBag, 
  ChevronRight,
  ChefHat,
  Info,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getRecipeSuggestions, getSpecificRecipe, Recipe } from './services/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [pantry, setPantry] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [servings, setServings] = useState(2);

  const addIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !pantry.includes(inputValue.trim().toLowerCase())) {
      setPantry([...pantry, inputValue.trim().toLowerCase()]);
      setInputValue('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setPantry(pantry.filter(i => i !== ingredient));
  };

  const handleSuggest = async () => {
    if (pantry.length === 0) return;
    setLoading(true);
    setRecipes([]);
    const res = await getRecipeSuggestions(pantry, servings);
    setRecipes(res);
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setRecipes([]);
    const res = await getSpecificRecipe(searchQuery, pantry, servings);
    if (res) {
      setRecipes([res]);
      setSelectedRecipe(res);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] font-serif p-4 md:p-8">
      <header className="max-w-4xl mx-auto mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-4"
        >
          <div className="w-12 h-12 bg-[#5A5A40] rounded-full flex items-center justify-center text-white">
            <ChefHat size={28} />
          </div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight italic">Gusto</h1>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full h-48 md:h-64 mb-8 rounded-[40px] overflow-hidden"
        >
          <img 
            src="https://picsum.photos/seed/culinary/1200/400" 
            alt="Comida deliciosa" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F5F5F0]/80 to-transparent" />
        </motion.div>

        <p className="text-[#5A5A40] text-lg opacity-80">Cocina inteligente, saludable y sin desperdicios.</p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Pantry & Search */}
        <div className="lg:col-span-4 space-y-8">
          {/* Pantry Section */}
          <section className="bg-white rounded-[32px] p-6 shadow-sm border border-black/5">
            <div className="flex items-center gap-2 mb-6">
              <Utensils size={20} className="text-[#5A5A40]" />
              <h2 className="text-xl font-medium">Mi Despensa</h2>
            </div>
            
            <form onSubmit={addIngredient} className="relative mb-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ej: Pollo, arroz, cebolla..."
                className="w-full bg-[#F5F5F0] rounded-full px-5 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 font-sans"
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 w-8 h-8 bg-[#5A5A40] rounded-full text-white flex items-center justify-center hover:bg-[#4A4A30] transition-colors"
                title="Añadir ingrediente"
              >
                <Plus size={20} />
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {pantry.length === 0 && (
                  <p className="text-sm italic text-gray-400 py-4 px-2">No has añadido ingredientes aún.</p>
                )}
                {pantry.map((item) => (
                  <motion.span
                    key={item}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-[#F5F5F0] px-4 py-1.5 rounded-full text-sm flex items-center gap-2 border border-black/5 hover:border-black/20 transition-all font-sans"
                  >
                    {item}
                    <button onClick={() => removeIngredient(item)} className="hover:text-red-500">
                      <X size={14} />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            {pantry.length > 0 && (
              <button
                onClick={handleSuggest}
                disabled={loading}
                className="w-full mt-6 bg-[#5A5A40] text-white py-3 rounded-full hover:bg-[#4A4A30] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Pensando..." : "¿Qué puedo cocinar?"}
              </button>
            )}
          </section>

          {/* Servings Section */}
          <section className="bg-white rounded-[32px] p-6 shadow-sm border border-black/5">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 size={20} className="text-[#5A5A40]" />
              <h2 className="text-xl font-medium">Porciones</h2>
            </div>
            <div className="flex items-center justify-between bg-[#F5F5F0] rounded-full p-2">
              <button 
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
                title="Menos personas"
              >
                <X size={16} className="rotate-45" />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold font-sans">{servings}</span>
                <span className="text-[10px] uppercase tracking-tighter opacity-50 font-sans">{servings === 1 ? 'Persona' : 'Personas'}</span>
              </div>
              <button 
                onClick={() => setServings(Math.min(10, servings + 1))}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
                title="Más personas"
              >
                <Plus size={16} />
              </button>
            </div>
          </section>

          {/* Search Section */}
          <section className="bg-white rounded-[32px] p-6 shadow-sm border border-black/5">
            <div className="flex items-center gap-2 mb-6">
              <Search size={20} className="text-[#5A5A40]" />
              <h2 className="text-xl font-medium">Búsqueda Directa</h2>
            </div>
            <form onSubmit={handleSearch} className="space-y-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej: Lasaña de berenjenas..."
                className="w-full bg-[#F5F5F0] rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 font-sans"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full border-2 border-[#5A5A40] text-[#5A5A40] py-3 rounded-full hover:bg-[#5A5A40] hover:text-white transition-all disabled:opacity-50"
              >
                Dime la receta
              </button>
            </form>
          </section>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8 space-y-8">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[40px] border-2 border-dashed border-[#5A5A40]/20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="mb-4"
              >
                <ChefHat size={48} className="text-[#5A5A40]" />
              </motion.div>
              <p className="text-lg italic text-[#5A5A40]">El chef está diseñando tu menú...</p>
            </div>
          )}

          {!loading && recipes.length > 0 && !selectedRecipe && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-3xl font-medium italic">Sugerencias para {servings} {servings === 1 ? 'persona' : 'personas'}</h2>
                <button 
                  onClick={() => setRecipes([])}
                  className="text-xs uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity"
                >
                  Limpiar
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recipes.map((recipe, idx) => (
                  <RecipeCard key={idx} recipe={recipe} onClick={() => setSelectedRecipe(recipe)} />
                ))}
              </div>
            </motion.div>
          )}

          {!loading && selectedRecipe && (
            <RecipeDetail recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} />
          )}

          {!loading && recipes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 opacity-40">
              <Utensils size={64} strokeWidth={1} />
              <p className="mt-4 text-xl italic">Selecciona ingredientes o busca un plato para comenzar.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function RecipeCard({ recipe, onClick }: { recipe: Recipe; onClick: () => void }) {
  const missingCount = recipe.ingredients.filter(i => i.isMissing).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-white rounded-[32px] p-6 shadow-sm border border-black/5 cursor-pointer hover:shadow-xl transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-medium leading-tight">{recipe.name}</h3>
        {missingCount > 0 && (
          <span className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full font-sans font-medium">
            Faltan {missingCount}
          </span>
        )}
      </div>
      
      <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed">
        {recipe.description}
      </p>

      <div className="flex items-center gap-4 text-sm text-[#5A5A40] mb-6">
        <div className="flex items-center gap-1.5">
          <Clock size={16} />
          <span className="font-sans">{recipe.cookTime}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame size={16} />
          <span className="font-sans">{recipe.nutrition.calories} kcal</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-top border-black/5">
        <span className="text-xs uppercase tracking-widest font-sans font-semibold opacity-40">Ver receta</span>
        <ChevronRight size={18} className="text-[#5A5A40]" />
      </div>
    </motion.div>
  );
}

function RecipeDetail({ recipe, onBack }: { recipe: Recipe; onBack: () => void }) {
  const missingIngredients = recipe.ingredients.filter(i => i.isMissing);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-black/5"
    >
      <div className="p-8">
        <button 
          onClick={onBack}
          className="mb-8 text-[#5A5A40] flex items-center gap-2 hover:translate-x-[-4px] transition-transform"
        >
          <ChevronRight size={20} className="rotate-180" />
          <span className="text-sm uppercase tracking-widest font-sans font-semibold">Volver</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-4xl font-medium mb-4">{recipe.name}</h2>
            <p className="text-lg text-gray-600 italic mb-8 leading-relaxed">
              {recipe.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-12">
              <div className="bg-[#F5F5F0] p-4 rounded-2xl flex flex-col gap-1 text-center">
                <Clock size={20} className="mx-auto text-[#5A5A40]" />
                <span className="text-xs uppercase tracking-wider opacity-40">Cocción</span>
                <span className="font-medium">{recipe.cookTime}</span>
              </div>
              <div className="bg-[#F5F5F0] p-4 rounded-2xl flex flex-col gap-1 text-center">
                <Utensils size={20} className="mx-auto text-[#5A5A40]" />
                <span className="text-xs uppercase tracking-wider opacity-40">Porciones</span>
                <span className="font-medium">{recipe.servings} pzs</span>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                  <Flame size={20} className="text-[#5A5A40]" />
                  Nutrición (por porción)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-medium">{recipe.nutrition.calories}</p>
                    <p className="text-[10px] uppercase tracking-widest opacity-40">kcal</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-medium">{recipe.nutrition.protein}</p>
                    <p className="text-[10px] uppercase tracking-widest opacity-40">Proteína</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-medium">{recipe.nutrition.carbs}</p>
                    <p className="text-[10px] uppercase tracking-widest opacity-40">Carbohidratos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-medium">{recipe.nutrition.fats}</p>
                    <p className="text-[10px] uppercase tracking-widest opacity-40">Grasas</p>
                  </div>
                </div>
              </div>

              {missingIngredients.length > 0 && (
                <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
                  <h3 className="text-orange-900 font-medium mb-3 flex items-center gap-2">
                    <ShoppingBag size={18} />
                    Lista de Compras
                  </h3>
                  <ul className="space-y-2">
                    {missingIngredients.map((ing, i) => (
                      <li key={i} className="text-sm text-orange-800 flex items-center gap-2 font-sans">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                        {ing.item} ({ing.amount})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-12">
            <section>
              <h3 className="text-2xl font-medium mb-6 underline decoration-black/10 underline-offset-8">Ingredientes</h3>
              <ul className="space-y-4">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className={cn(
                    "flex items-center justify-between pb-3 border-b border-black/5 font-sans",
                    ing.isMissing && "opacity-50 italic"
                  )}>
                    <div className="flex items-center gap-3">
                      {ing.isMissing ? <Circle size={18} className="text-gray-300" /> : <CheckCircle2 size={18} className="text-[#5A5A40]" />}
                      <span>{ing.item}</span>
                    </div>
                    <span className="font-medium text-[#5A5A40]">{ing.amount}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-2xl font-medium mb-6 underline decoration-black/10 underline-offset-8">Preparación</h3>
              <div className="space-y-8">
                {recipe.steps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full border border-black/20 flex items-center justify-center font-sans text-xs font-bold">
                      {i + 1}
                    </div>
                    <div className="space-y-1">
                      <p className="leading-relaxed text-gray-700">{step.instruction}</p>
                      {step.duration && (
                        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#5A5A40] font-sans font-bold">
                          <Clock size={12} />
                          {step.duration}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
