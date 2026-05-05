import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const StatChart = () => {
  // Giữ nguyên logic lấy data từ localStorage của bạn
  const [statsGender, setStatsGender] = useState(() => {
    const saved = localStorage.getItem('statsGender');
    return saved
      ? JSON.parse(saved)
      : [
          { gender: 'Nam', count: 0 },
          { gender: 'Nữ', count: 0 },
        ];
  });

  const [statsProvince, setStatsProvince] = useState(() => {
    const saved = localStorage.getItem('statsProvince');
    return saved
      ? JSON.parse(saved)
      : [
          { province: 'Hà Nội', count: 0 },
          { province: 'Hồ Chí Minh', count: 0 },
        ];
  });

  useEffect(() => {
    fetch('https://localhost:5066/api/customer/stats')
      .then((res) => res.json())
      .then((data) => {
        setStatsGender(data.genderData);
        setStatsProvince(data.provinceData);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem('statsGender', JSON.stringify(statsGender));
    localStorage.setItem('statsProvince', JSON.stringify(statsProvince));
  }, [statsGender, statsProvince]);

  // Bảng màu hiện đại hơn
  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

  return (
    <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2">
      {/* Card 1: Giới tính */}
      <div className="flex flex-col items-center rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-lg font-semibold text-gray-700">Tỉ lệ giới tính</h4>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statsGender}
                cx="50%"
                cy="50%"
                innerRadius={70} // Biến thành hình nhẫn cho đẹp
                outerRadius={100}
                paddingAngle={8}
                nameKey="gender"
                dataKey="count"
              >
                {statsGender.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card 2: Tỉnh thành */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-center text-lg font-semibold text-gray-700">
          Phân bổ theo Tỉnh thành
        </h4>
        <div className="h-[350px] w-full">
          {' '}
          {/* Tăng nhẹ chiều cao để cột thoáng hơn */}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statsProvince} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="province"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                interval={0} // Hiển thị tất cả tên tỉnh
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: '#F9FAFB' }} // Hiệu ứng hover nhẹ vào vùng cột
                contentStyle={{
                  borderRadius: '10px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]} // Bo góc nhẹ đầu cột cho hiện đại
                barSize={40} // Độ rộng của cột
              >
                {statsProvince.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatChart;
