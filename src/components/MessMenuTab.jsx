import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const MEALS = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];

export default function MessMenuTab({ api }) {
  const [menu, setMenu] = useState(null);
  const [activeCycle, setActiveCycle] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/mess/menu').then(data => {
      setMenu(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-20 text-center"><span className="material-symbols-outlined animate-spin text-4xl text-primary/20">progress_activity</span></div>;
  if (!menu) return (
    <div className="flex flex-col items-center justify-center p-20 bg-surface-container-low rounded-3xl border border-dashed border-outline-variant/30">
      <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4">restaurant</span>
      <p className="text-on-surface-variant font-bold">No mess menu published yet.</p>
    </div>
  );

  const maxCycles = Math.max(...menu.items.map(i => i.weekCycle), 1);
  const isMonthly = menu.menuType !== 'WEEKLY';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">restaurant_menu</span>
            Mess Menu
          </h3>
          <p className="text-sm text-on-surface-variant font-medium">
            {menu.menuType === 'WEEKLY' ? 'Standard Weekly Schedule' : `${menu.month} ${menu.year} Schedule`}
          </p>
        </div>

        {isMonthly && (
          <div className="flex p-1 bg-surface-container-high rounded-2xl self-start">
            {[...Array(maxCycles)].map((_, i) => {
              const cycle = i + 1;
              const label = menu.menuType === 'MONTHLY_CYCLE' ? (cycle === 1 ? 'Week 1 & 3' : 'Week 2 & 4') : `Week ${cycle}`;
              return (
                <button
                  key={cycle}
                  onClick={() => setActiveCycle(cycle)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeCycle === cycle ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <motion.div 
        key={activeCycle}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto overflow-y-hidden styled-scrollbar">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="p-4 border-b border-r border-outline-variant/10 w-24 text-left font-black text-on-surface-variant uppercase tracking-widest text-[10px]">Meal</th>
                {DAYS.map(day => (
                  <th key={day} className="p-4 border-b border-outline-variant/10 text-left font-black text-on-surface-variant uppercase tracking-widest text-[10px] min-w-[140px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {MEALS.map(meal => (
                <tr key={meal} className="hover:bg-primary/5 transition-colors group">
                  <td className="p-4 border-r border-outline-variant/10 font-bold text-on-surface bg-surface-container-low/20 group-hover:bg-primary/10 transition-colors">
                    <div className="flex flex-col items-center gap-1">
                       <span className="material-symbols-outlined text-xl text-primary opacity-60 group-hover:opacity-100 transition-opacity">
                         {meal === 'BREAKFAST' ? 'coffee' : meal === 'LUNCH' ? 'restaurant' : meal === 'SNACKS' ? 'bakery_dining' : 'dinner_dining'}
                       </span>
                       <span className="text-[10px] tracking-tighter">{meal}</span>
                    </div>
                  </td>
                  {DAYS.map(day => {
                    const items = menu.items.find(i => i.weekCycle === activeCycle && i.day === day && i.mealType === meal)?.foodItems;
                    return (
                      <td key={day} className="p-4 align-top">
                        <div className="text-[11px] font-semibold text-on-surface leading-relaxed whitespace-pre-line group-hover:text-primary transition-colors">
                          {items || <span className="text-on-surface-variant/30 font-normal">—</span>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary">info</span>
        <div>
          <div className="text-sm font-bold text-primary">Mess Information</div>
          <p className="text-xs text-on-secondary-container-variant opacity-80 mt-1 leading-relaxed">
            The menu is subject to change based on availability and holidays. Please contact the Mess Warden for any dietary requirements or grievances.
          </p>
        </div>
      </div>
    </div>
  );
}
