export default function StatCard({ title, value, subtitle, icon, color = "indigo", trend }) {
  const colorClasses = {
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      grad: "from-indigo-600 to-blue-600",
      shadow: "shadow-indigo-100"
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      grad: "from-blue-600 to-cyan-600",
      shadow: "shadow-blue-100"
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      grad: "from-green-600 to-emerald-600",
      shadow: "shadow-green-100"
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-600",
      grad: "from-red-600 to-pink-600",
      shadow: "shadow-red-100"
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      grad: "from-orange-600 to-amber-600",
      shadow: "shadow-orange-100"
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      grad: "from-amber-600 to-yellow-600",
      shadow: "shadow-amber-100"
    }
  };

  const selectedColor = colorClasses[color] || colorClasses.indigo;

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100 hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
      {/* Decorative background circle */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 ${selectedColor.bg} rounded-full opacity-0 group-hover:opacity-50 transition-all duration-700 -z-0`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div className={`w-14 h-14 bg-gradient-to-br ${selectedColor.grad} rounded-2xl flex items-center justify-center shadow-lg ${selectedColor.shadow} transform group-hover:scale-110 transition-transform duration-500`}>
            {icon && <div className="text-white">{icon}</div>}
          </div>
          {trend && (
            <div className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 ${trend > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </div>
          )}
        </div>
        
          <div>
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-gray-900 tracking-tighter">{value}</p>
              {subtitle && (
                <p className="text-[10px] font-bold text-gray-400">{subtitle}</p>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}

