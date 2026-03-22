'use client';
import { useAssignmentStore } from '@/store/assignmentStore';
import { CheckCircle, XCircle, Zap, Brain, Database, Wifi } from 'lucide-react';
import clsx from 'clsx';

const STEPS = [
  { icon: Wifi, label: 'Connected to server', threshold: 10 },
  { icon: Brain, label: 'Building AI prompt', threshold: 30 },
  { icon: Zap, label: 'Generating questions', threshold: 60 },
  { icon: Database, label: 'Saving to database', threshold: 85 },
  { icon: CheckCircle, label: 'Completed', threshold: 100 },
];

export default function ProcessingView({ assignmentId }: { assignmentId: string }) {
  const { job } = useAssignmentStore();
  const { progress, message, status } = job;

  const failed = status === 'failed';
  const completed = status === 'completed';

  return (
    <div className="w-full max-w-md mx-auto px-4 animate-fade-up">
      {/* Central animation */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative w-24 h-24 mb-6">
          {/* Rings */}
          <div className={clsx(
            'absolute inset-0 rounded-full border-2 animate-ping',
            failed ? 'border-rose-veda/30' : 'border-saffron/30'
          )} />
          <div className={clsx(
            'absolute inset-2 rounded-full border-2',
            failed ? 'border-rose-veda/20' : 'border-indigo-veda/20',
            !failed && !completed && 'animate-spin-slow'
          )} style={{ borderTopColor: failed ? '#F43F5E' : '#4B3F8E' }} />

          {/* Center */}
          <div className={clsx(
            'absolute inset-4 rounded-full flex items-center justify-center',
            failed ? 'bg-rose-veda/10' : completed ? 'bg-jade/10' : 'bg-saffron/10'
          )}>
            {failed ? (
              <XCircle size={28} className="text-rose-veda" />
            ) : completed ? (
              <CheckCircle size={28} className="text-jade" />
            ) : (
              <Brain size={28} className="text-saffron animate-pulse-slow" />
            )}
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold text-paper mb-2 text-center">
          {failed ? 'Generation Failed' : completed ? 'Paper Ready!' : 'Generating Your Paper'}
        </h2>
        <p className="text-paper/40 text-sm text-center max-w-xs">
          {message || 'Processing your assignment...'}
        </p>
      </div>

      {/* Progress bar */}
      {!failed && (
        <div className="mb-8">
          <div className="flex justify-between text-xs text-paper/30 mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className={clsx(
                'progress-fill',
                completed && 'bg-gradient-to-r from-jade to-jade/80'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="glass rounded-2xl p-5 space-y-3">
        {STEPS.map((step, i) => {
          const done = progress >= step.threshold;
          const active = !done && progress >= (STEPS[i - 1]?.threshold ?? 0);
          const Icon = step.icon;

          return (
            <div key={i} className="flex items-center gap-3">
              <div className={clsx(
                'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500',
                done
                  ? 'bg-jade/15 border border-jade/30'
                  : active
                  ? 'bg-saffron/15 border border-saffron/30 animate-pulse'
                  : 'bg-ink-muted/50 border border-ink-muted'
              )}>
                <Icon
                  size={13}
                  className={clsx(
                    'transition-colors duration-500',
                    done ? 'text-jade' : active ? 'text-saffron' : 'text-paper/20'
                  )}
                />
              </div>
              <span className={clsx(
                'text-sm transition-colors duration-500',
                done ? 'text-paper/70' : active ? 'text-paper' : 'text-paper/25'
              )}>
                {step.label}
              </span>
              {done && (
                <CheckCircle size={12} className="ml-auto text-jade flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Assignment ID ref */}
      <p className="text-center text-paper/15 text-xs mt-6 font-mono">
        ID: {assignmentId}
      </p>
    </div>
  );
}
