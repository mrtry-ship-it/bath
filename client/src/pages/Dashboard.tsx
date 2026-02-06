import { useBaths } from "@/hooks/use-baths";
import { BathCard } from "@/components/BathCard";
import { BathForm } from "@/components/BathForm";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Plus, Waves, Clock, Calendar, Star } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, subDays } from "date-fns";

export default function Dashboard() {
  const { data: baths, isLoading, error } = useBaths();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-primary/20 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error loading data
      </div>
    );
  }

  const sortedBaths = [...(baths || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Stats Calculation
  const totalBaths = baths?.length || 0;
  const totalMinutes = baths?.reduce((acc, curr) => acc + curr.durationMinutes, 0) || 0;
  const avgDuration = totalBaths ? Math.round(totalMinutes / totalBaths) : 0;
  const avgRating = totalBaths 
    ? (baths?.reduce((acc, curr) => acc + curr.rating, 0) || 0) / totalBaths 
    : 0;

  // Chart Data Preparation (Last 7 days)
  const chartData = baths
    ?.slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(bath => ({
      date: format(new Date(bath.date), 'MMM d'),
      duration: bath.durationMinutes,
      rating: bath.rating
    })) || [];

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-800">
            Bath Journal
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Track your relaxation journey
          </p>
        </div>
        <BathForm 
          trigger={
            <Button className="btn-primary gap-2">
              <Plus className="w-5 h-5" />
              Log Bath
            </Button>
          }
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Baths" 
          value={totalBaths} 
          icon={Waves}
          className="bg-sky-50/50 border-sky-100"
        />
        <StatsCard 
          title="Avg Duration" 
          value={`${avgDuration}m`} 
          icon={Clock}
          className="bg-teal-50/50 border-teal-100"
        />
        <StatsCard 
          title="Avg Rating" 
          value={avgRating.toFixed(1)} 
          icon={Star}
          className="bg-amber-50/50 border-amber-100"
        />
        <StatsCard 
          title="This Month" 
          value={baths?.filter(b => new Date(b.date) > subDays(new Date(), 30)).length || 0} 
          icon={Calendar}
          className="bg-indigo-50/50 border-indigo-100"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Duration Chart */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-slate-700 mb-6 font-display">Duration History</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    unit="m"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="duration" 
                    stroke="#0ea5e9" 
                    fillOpacity={1} 
                    fill="url(#colorDuration)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent History List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-semibold text-slate-800">Recent History</h3>
          </div>
          
          <div className="space-y-4">
            {sortedBaths.length === 0 ? (
              <div className="text-center py-12 bg-white/50 rounded-2xl border border-dashed border-slate-300">
                <Waves className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No baths recorded yet.</p>
                <p className="text-sm text-slate-400">Start your relaxation journey today.</p>
              </div>
            ) : (
              sortedBaths.slice(0, 5).map((bath) => (
                <BathCard key={bath.id} bath={bath} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
