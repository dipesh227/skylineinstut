import React from 'react';
import { Enquiry, Course } from '@/types';

interface DashboardChartsProps {
  enquiries: Enquiry[];
  courses: Course[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ enquiries, courses }) => {
  const paidEnquiries = enquiries.filter(e => e.fee_paid && e.created_at);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyRevenue = Array(12).fill(0);

  paidEnquiries.forEach(e => {
    const date = new Date(e.created_at);
    const month = date.getMonth();
    let fee = e.fee_amount;
    if (!fee) {
      const matchCourse = courses.find(c => c.title === e.course);
      fee = matchCourse ? matchCourse.fee_numeric : 25000;
    }
    monthlyRevenue[month] += fee;
  });

  const maxRevenue = Math.max(...monthlyRevenue, 20000);

  const courseCountMap: Record<string, number> = {};
  courses.forEach(c => { courseCountMap[c.title] = 0; });
  courseCountMap['General Inquiry'] = 0;

  enquiries.forEach(e => {
    const title = e.course || 'General Inquiry';
    if (courseCountMap[title] !== undefined) {
      courseCountMap[title]++;
    } else {
      courseCountMap[title] = 1;
    }
  });

  const courseCounts = Object.entries(courseCountMap)
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-gray-900 font-heading">Monthly Fee Collections (2026)</h4>
          <p className="text-xs text-gray-500 mt-1">Total revenue based on confirmed admissions</p>
        </div>
        <div className="relative h-64 w-full flex-1 flex items-end justify-between pt-6 border-b border-gray-100 pb-1 px-2">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-gray-400 font-mono">
            <div className="border-t border-gray-100 w-full pt-1 text-right pr-2">₹{(maxRevenue/1000).toFixed(0)}k</div>
            <div className="border-t border-gray-100 w-full pt-1 text-right pr-2">₹{(maxRevenue*0.75/1000).toFixed(0)}k</div>
            <div className="border-t border-gray-100 w-full pt-1 text-right pr-2">₹{(maxRevenue*0.5/1000).toFixed(0)}k</div>
            <div className="border-t border-gray-100 w-full pt-1 text-right pr-2">₹{(maxRevenue*0.25/1000).toFixed(0)}k</div>
            <div className="w-full text-right pr-2">₹0</div>
          </div>
          <div className="flex-1 flex items-end justify-between h-full z-10 gap-2 md:gap-3">
            {months.map((month, idx) => {
              const rev = monthlyRevenue[idx];
              const heightPercent = rev > 0 ? (rev / maxRevenue) * 90 : 2;
              return (
                <div key={month} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  <div className="absolute bottom-full mb-2 bg-accent text-white font-mono text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap shadow-md">
                    ₹{rev.toLocaleString('en-IN')}
                  </div>
                  <div style={{ height: `${heightPercent}%` }} className={`w-full rounded-t-md transition-all duration-500 cursor-pointer ${rev > 0 ? 'bg-primary hover:bg-primary-light' : 'bg-gray-100'}`} />
                  <span className="text-[10px] text-gray-500 mt-2 font-medium">{month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Course Enquiry Distribution */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-gray-900 font-heading">Enquiry Volume by Course Interest</h4>
          <p className="text-xs text-gray-500 mt-1">Lead volume and demand breakdown per course</p>
        </div>
        <div className="flex-1 flex flex-col justify-center space-y-4">
          {courseCounts.map((course, idx) => {
            const total = enquiries.length || 1;
            const percentage = Math.round((course.count / total) * 100);
            const colors = ['bg-primary', 'bg-secondary', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500'];
            const colorClass = colors[idx % colors.length];
            return (
              <div key={course.title} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-700 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                    {course.title.length > 32 ? `${course.title.substring(0,32)}...` : course.title}
                  </span>
                  <span className="text-gray-500 font-mono">{course.count} ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div style={{ width: `${percentage}%` }} className={`h-full rounded-full transition-all duration-500 ${colorClass}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};