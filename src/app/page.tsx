'use client';
import { useState, useEffect } from 'react';
import resumeData from '../../resume-data.json';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'dark bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
    }`}>
      {/* Header with controls */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-white/20 dark:border-slate-700/50 print:hidden shadow-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Rafael Sathler ✨
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-slate-800 dark:to-indigo-800 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <span className="text-xl">{isDarkMode ? '☀️' : '🌙'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm font-medium"
            >
              📄 PDF
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 space-y-16">
        {/* Hero Section */}
        <section className="text-center relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="relative z-10">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-600 mx-auto mb-6 flex items-center justify-center text-4xl text-white font-bold shadow-2xl animate-pulse">
              RBS
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              {resumeData.basics.name}
            </h2>
            
            <p className="text-2xl md:text-3xl text-slate-600 dark:text-slate-300 font-light mb-8">
              {resumeData.basics.label}
            </p>
            
            <div className="max-w-4xl mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50">
              <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                {resumeData.basics.summary}
              </p>
            </div>
            
            {/* Contact Info */}
            <div className="mt-8 flex justify-center flex-wrap gap-6 text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-2">📧 {resumeData.basics.email}</span>
              <span className="flex items-center gap-2">📱 {resumeData.basics.phone}</span>
              <span className="flex items-center gap-2">📍 {resumeData.basics.location.city}, {resumeData.basics.location.region}</span>
            </div>
          </div>
        </section>

        {/* Experience */}
        <section>
          <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            💼 Professional Experience
          </h2>
          <div className="space-y-8">
            {resumeData.work.map((job, index) => (
              <div key={index} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 hover:shadow-indigo-500/20 transition-all duration-500">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                      {job.position}
                    </h3>
                    <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">{job.name}</p>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400 mt-2 md:mt-0 px-4 py-2 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                    {job.startDate} - {job.endDate}
                  </span>
                </div>
                <p className="text-lg text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                  {job.summary}
                </p>
                <ul className="space-y-2">
                  {job.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-indigo-500 mt-1">▸</span>
                      <span className="text-slate-600 dark:text-slate-400">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section>
          <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            🛠️ Technical Skills
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {resumeData.skills.map((skillCategory, index) => (
              <div key={index} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {skillCategory.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillCategory.keywords.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-slate-700 dark:to-indigo-800 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 border border-indigo-200 dark:border-slate-600">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section>
          <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            🚀 Featured Projects
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {resumeData.projects.map((project, index) => (
              <div key={index} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {project.name}
                </h3>
                <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
                  {project.description}
                </p>
                <ul className="space-y-2 mb-4">
                  {project.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-indigo-500 mt-1">▸</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{highlight}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {project.keywords.map((keyword, i) => (
                    <span key={i} className="px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section>
          <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            🎓 Education
          </h2>
          <div className="max-w-3xl mx-auto">
            {resumeData.education.map((edu, index) => (
              <div key={index} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                  <div>
                    <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {edu.studyType} in {edu.area}
                    </h3>
                    <p className="text-xl text-slate-700 dark:text-slate-300">
                      {edu.institution}
                    </p>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400 mt-2 md:mt-0 px-4 py-2 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}