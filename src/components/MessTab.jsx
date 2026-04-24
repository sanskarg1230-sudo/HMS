import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const MEALS = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function MessTab({ toast, api }) {
  const [menu, setMenu] = useState(null);
  const [menuType, setMenuType] = useState('WEEKLY'); // WEEKLY, MONTHLY_CYCLE, MONTHLY_FULL
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [gridData, setGridData] = useState({}); // { 'week-day-meal': 'items' }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const data = await api.get('/mess/menu');
      if (data) {
        setMenu(data);
        setMenuType(data.menuType);
        setMonth(data.month || MONTHS[new Date().getMonth()]);
        setYear(data.year || new Date().getFullYear());
        
        const newGrid = {};
        data.items.forEach(item => {
          newGrid[`${item.weekCycle}-${item.day}-${item.mealType}`] = item.foodItems;
        });
        setGridData(newGrid);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCellChange = (week, day, meal, value) => {
    setGridData(prev => ({
      ...prev,
      [`${week}-${day}-${meal}`]: value
    }));
  };

  const saveMenu = async () => {
    try {
      setSaving(true);
      const items = [];
      const numWeeks = menuType === 'WEEKLY' ? 1 : (menuType === 'MONTHLY_CYCLE' ? 2 : 4);
      
      for (let w = 1; w <= numWeeks; w++) {
        DAYS.forEach(day => {
          MEALS.forEach(meal => {
            const val = gridData[`${w}-${day}-${meal}`] || '';
            items.push({
              day,
              mealType: meal,
              foodItems: val,
              weekCycle: w
            });
          });
        });
      }

      const payload = {
        id: menu?.id,
        menuType,
        month,
        year,
        items
      };

      const res = await api.post('/mess/menu', payload);
      setMenu(res);
      toast('Mess menu saved successfully!', 'success');
    } catch (err) {
      toast('Failed to save menu', 'error');
    } finally {
      setSaving(false);
    }
  };

  const download = async (format) => {
    if (!menu?.id) return toast('Please save the menu first', 'warning');
    try {
      const blob = await api.download(`/mess/menu/${menu.id}/${format}`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mess_menu_${month}_${year}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      toast('Failed to download file', 'error');
    }
  };

  const deleteMenu = async () => {
    if (!window.confirm('Delete this menu?')) return;
    try {
      if (menu?.id) await api.delete(`/mess/menu/${menu.id}`);
      setMenu(null);
      setGridData({});
      toast('Menu deleted', 'success');
    } catch (err) {
      toast('Failed to delete', 'error');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setLoading(true);
      const res = await api.upload('/mess/menu/import', formData);
      if (res.error) throw new Error(res.message);
      
      toast('Menu imported successfully!', 'success');
      loadMenu(); // Refresh everything
    } catch (err) {
      toast(err.message || 'Import failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center"><span className="material-symbols-outlined animate-spin text-4xl text-primary/20">progress_activity</span></div>;

  const numWeeks = menuType === 'WEEKLY' ? 1 : (menuType === 'MONTHLY_CYCLE' ? 2 : 4);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-on-surface">Mess Management</h3>
          <p className="text-xs text-on-surface-variant font-medium">Create and manage your hostel's food schedule</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={menuType} 
            onChange={(e) => setMenuType(e.target.value)}
            className="px-4 py-2.5 bg-white rounded-xl text-sm font-bold border border-outline-variant/20 outline-none focus:border-primary transition-all shadow-sm"
          >
            <option value="WEEKLY">Weekly Menu</option>
            <option value="MONTHLY_CYCLE">Monthly (2-Week Cycle)</option>
            <option value="MONTHLY_FULL">Monthly (Full 4-Weeks)</option>
          </select>

          {menuType !== 'WEEKLY' && (
            <>
              <select 
                value={month} 
                onChange={(e) => setMonth(e.target.value)}
                className="px-4 py-2.5 bg-white rounded-xl text-sm font-bold border border-outline-variant/20 outline-none focus:border-primary transition-all shadow-sm"
              >
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input 
                type="number" 
                value={year} 
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-24 px-4 py-2.5 bg-white rounded-xl text-sm font-bold border border-outline-variant/20 outline-none focus:border-primary transition-all shadow-sm"
              />
            </>
          )}

          <div className="flex gap-2 ml-auto lg:ml-0">
            <input 
              type="file" 
              id="mess-import" 
              className="hidden" 
              accept=".xlsx" 
              onChange={handleImport} 
            />
            <label 
              htmlFor="mess-import"
              className="px-4 py-2.5 bg-surface-container-high text-on-surface text-sm font-bold rounded-xl hover:bg-surface-container-highest transition-all cursor-pointer flex items-center gap-2 border border-outline-variant/10"
            >
              <span className="material-symbols-outlined text-sm">upload_file</span>
              Import
            </label>
            <button 
              onClick={saveMenu} 
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center gap-2"
            >
              {saving ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : <span className="material-symbols-outlined text-sm">save</span>}
              Save
            </button>
            <button 
              onClick={deleteMenu}
              className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all border border-red-100"
            >
              <span className="material-symbols-outlined text-xl leading-none">delete</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 px-2">
        <button onClick={() => download('pdf')} className="text-xs font-bold px-3 py-1.5 bg-surface-container-high rounded-lg hover:bg-surface-container-highest transition-all flex items-center gap-1.5 text-on-surface">
          <span className="material-symbols-outlined text-base">picture_as_pdf</span> PDF
        </button>
        <button onClick={() => download('excel')} className="text-xs font-bold px-3 py-1.5 bg-surface-container-high rounded-lg hover:bg-surface-container-highest transition-all flex items-center gap-1.5 text-on-surface">
          <span className="material-symbols-outlined text-base">table_view</span> Excel
        </button>
      </div>

      {/* Tables Container */}
      <div className="space-y-8 pb-10">
        {[...Array(numWeeks)].map((_, wIdx) => {
          const week = wIdx + 1;
          let weekTitle = menuType === 'WEEKLY' ? 'Weekly Menu' : (menuType === 'MONTHLY_CYCLE' ? (week === 1 ? 'Week 1 & 3 Template' : 'Week 2 & 4 Template') : `Week ${week}`);
          
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: wIdx * 0.1 }}
              key={week} 
              className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm">{week}</div>
                <h4 className="font-bold text-on-surface">{weekTitle}</h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low/50">
                      <th className="p-4 border-b border-r border-outline-variant/10 w-24 text-left font-black text-on-surface-variant uppercase tracking-widest text-[10px]">Meal</th>
                      {DAYS.map(day => (
                        <th key={day} className="p-4 border-b border-outline-variant/10 text-left font-black text-on-surface-variant uppercase tracking-widest text-[10px]">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MEALS.map(meal => (
                      <tr key={meal} className="hover:bg-surface-container-lowest/50 transition-colors">
                        <td className="p-4 border-r border-b border-outline-variant/10 font-bold text-on-surface bg-surface-container-low/20">
                          <div className="flex items-center gap-2">
                             <span className="material-symbols-outlined text-sm text-primary">
                               {meal === 'BREAKFAST' ? 'coffee' : meal === 'LUNCH' ? 'restaurant' : meal === 'SNACKS' ? 'bakery_dining' : 'dinner_dining'}
                             </span>
                             {meal}
                          </div>
                        </td>
                        {DAYS.map(day => (
                          <td key={day} className="p-2 border-b border-outline-variant/10">
                            <textarea 
                              className="w-full min-h-[80px] p-2 bg-transparent outline-none focus:bg-primary/5 rounded-lg transition-all text-[11px] leading-relaxed resize-none border-none placeholder:text-outline-variant/30 font-medium"
                              placeholder="Enter food items..."
                              value={gridData[`${week}-${day}-${meal}`] || ''}
                              onChange={(e) => handleCellChange(week, day, meal, e.target.value)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
