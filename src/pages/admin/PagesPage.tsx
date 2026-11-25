import { Info } from 'lucide-react';

export function PagesPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Manage Pages</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-12 text-center max-w-2xl mx-auto mt-12">
        <Info className="w-12 h-12 text-brand-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Editing Disabled</h2>
        <p className="text-gray-600 leading-relaxed">
          The <strong>About Us</strong> and <strong>Contact Us</strong> pages have been custom-built and hardcoded into the application to ensure a premium, structured design and optimal performance. 
        </p>
        <p className="text-gray-600 leading-relaxed mt-4">
          They can no longer be edited from this admin panel. If you need to make changes to their content in the future, please update the respective React components directly.
        </p>
      </div>
    </div>
  );
}
