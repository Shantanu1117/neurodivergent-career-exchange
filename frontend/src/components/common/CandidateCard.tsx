import React from 'react';
import { CandidateProfile } from '../../types/index.js';
import { Sparkles, MapPin, Briefcase, Eye, ShieldCheck, HeartHandshake } from 'lucide-react';

interface CandidateCardProps {
  candidate: CandidateProfile;
  onViewProfile?: (candidate: CandidateProfile) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onViewProfile }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-subtle hover:shadow-card hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-100 to-indigo-100 text-brand-700 font-extrabold text-base flex items-center justify-center shrink-0 border border-brand-200/50">
              {candidate.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{candidate.fullName}</h3>
              <p className="text-xs text-slate-500 line-clamp-1">{candidate.headline}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {candidate.location}
                </span>
                <span>•</span>
                <span>{candidate.workPreferences?.workMode || 'Remote'}</span>
              </div>
            </div>
          </div>

          {candidate.assessmentResults?.primaryMatch && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 bg-brand-50 border border-brand-200/70 px-2.5 py-1 rounded-lg">
              <Sparkles className="w-3 h-3 text-brand-600" />
              <span>{candidate.assessmentResults.primaryMatch.split('/')[0]}</span>
            </span>
          )}
        </div>

        {/* "How I Work Best" Preview */}
        {candidate.howIWorkBest && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 mb-4 text-xs text-slate-700 leading-relaxed">
            <span className="font-semibold text-slate-900 block mb-1 flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-brand-600" />
              How I Work Best:
            </span>
            <p className="line-clamp-2 text-slate-600">{candidate.howIWorkBest}</p>
          </div>
        )}

        {/* Strengths & Skills */}
        <div className="space-y-2 mb-4">
          <div className="flex flex-wrap gap-1.5">
            {(candidate.strengths || []).slice(0, 3).map((strength) => (
              <span
                key={strength}
                className="px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-50 text-brand-800 border border-brand-200/50"
              >
                {strength}
              </span>
            ))}
            {(candidate.skills || []).slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Supported Accommodations */}
          {candidate.accommodations && candidate.accommodations.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-teal-800 bg-teal-50 px-2 py-1 rounded-md border border-teal-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate">
                Requested Adjustments: {candidate.accommodations.slice(0, 2).join(' • ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 font-medium">
          Prefers: {candidate.communicationPreferences?.primaryModality || 'Written'} Comms
        </span>
        {onViewProfile && (
          <button
            onClick={() => onViewProfile(candidate)}
            className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Profile</span>
          </button>
        )}
      </div>
    </div>
  );
};
