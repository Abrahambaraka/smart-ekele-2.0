import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ClassScheduleCalendar = ({ classes, onScheduleClick }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek?.getDay();
    const diff = startOfWeek?.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek?.setDate(diff);

    for (let i = 0; i < 6; i++) {
      const day = new Date(startOfWeek);
      day?.setDate(startOfWeek?.getDate() + i);
      week?.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(currentWeek);

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate?.setDate(currentWeek?.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  const getClassesForTimeSlot = (dayIndex, timeSlot) => {
    const dayName = daysOfWeek?.[dayIndex]?.toLowerCase();
    return classes?.filter(classItem => {
      if (!classItem?.schedule || !classItem?.schedule?.days || !classItem?.schedule?.startTime) {
        return false;
      }
      
      const classDays = classItem?.schedule?.days?.toLowerCase();
      const classStartTime = classItem?.schedule?.startTime;
      
      return classDays?.includes(dayName) && classStartTime === timeSlot;
    });
  };

  const getClassColor = (subject) => {
    const colors = {
      'mathematiques': 'bg-blue-100 text-blue-800 border-blue-200',
      'francais': 'bg-green-100 text-green-800 border-green-200',
      'sciences': 'bg-purple-100 text-purple-800 border-purple-200',
      'histoire': 'bg-orange-100 text-orange-800 border-orange-200',
      'anglais': 'bg-red-100 text-red-800 border-red-200',
      'physique': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'chimie': 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors?.[subject] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="Calendar" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Planning des Classes</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="ChevronLeft"
              onClick={() => navigateWeek(-1)}
            />
            <div className="px-4 py-2 text-sm font-medium text-foreground">
              {weekDates?.[0]?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {' '}
              {weekDates?.[5]?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <Button
              variant="outline"
              size="sm"
              iconName="ChevronRight"
              onClick={() => navigateWeek(1)}
            />
          </div>
        </div>
      </div>
      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-border">
            <div className="p-3 text-sm font-medium text-muted-foreground bg-muted/30">
              Heure
            </div>
            {daysOfWeek?.map((day, index) => (
              <div key={day} className="p-3 text-center border-l border-border">
                <div className="text-sm font-medium text-foreground">{day}</div>
                <div className="text-xs text-muted-foreground">
                  {weekDates?.[index]?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {timeSlots?.map((timeSlot) => (
            <div key={timeSlot} className="grid grid-cols-7 border-b border-border min-h-[80px]">
              <div className="p-3 text-sm font-medium text-muted-foreground bg-muted/30 border-r border-border">
                {timeSlot}
              </div>
              {daysOfWeek?.map((day, dayIndex) => {
                const classesInSlot = getClassesForTimeSlot(dayIndex, timeSlot);
                return (
                  <div key={`${day}-${timeSlot}`} className="p-2 border-l border-border relative">
                    {classesInSlot?.map((classItem) => (
                      <button
                        key={classItem?.id}
                        onClick={() => onScheduleClick(classItem)}
                        className={`w-full p-2 rounded-md border text-xs font-medium transition-micro hover:shadow-sm ${getClassColor(classItem?.subject)} mb-1`}
                      >
                        <div className="truncate font-semibold">{classItem?.name}</div>
                        <div className="truncate opacity-75">{classItem?.teacher}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="truncate">{classItem?.room || 'Salle TBD'}</span>
                          <span>{classItem?.studentCount}/{classItem?.capacity}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-foreground">Légende:</span>
            <div className="flex items-center space-x-3">
              {Object.entries({
                'mathematiques': 'Mathématiques',
                'francais': 'Français',
                'sciences': 'Sciences',
                'histoire': 'Histoire'
              })?.map(([key, label]) => (
                <div key={key} className="flex items-center space-x-1">
                  <div className={`w-3 h-3 rounded border ${getClassColor(key)}`} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Cliquez sur une classe pour voir les détails
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassScheduleCalendar;