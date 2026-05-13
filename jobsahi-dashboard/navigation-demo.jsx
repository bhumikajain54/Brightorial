import React, { useState } from 'react';
import NavigationTabs from './src/shared/components/navigation.jsx';

// Demo component to show how navigation adapts to different numbers of tabs
const NavigationDemo = () => {
  const [activeTab, setActiveTab] = useState('tab1');

  // Example with 2 tabs
  const twoTabs = [
    { id: 'tab1', label: 'Dashboard', icon: () => <div>📊</div> },
    { id: 'tab2', label: 'Settings', icon: () => <div>⚙️</div> }
  ];

  // Example with 3 tabs
  const threeTabs = [
    { id: 'tab1', label: 'Dashboard', icon: () => <div>📊</div> },
    { id: 'tab2', label: 'Analytics', icon: () => <div>📈</div> },
    { id: 'tab3', label: 'Settings', icon: () => <div>⚙️</div> }
  ];

  // Example with 4 tabs (like your current setup)
  const fourTabs = [
    { id: 'tab1', label: 'Push Notifications', icon: () => <div>🔔</div> },
    { id: 'tab2', label: 'User Segments', icon: () => <div>👥</div> },
    { id: 'tab3', label: 'Email & SMS', icon: () => <div>📧</div> },
    { id: 'tab4', label: 'Templates', icon: () => <div>📄</div> }
  ];

  // Example with 5 tabs
  const fiveTabs = [
    { id: 'tab1', label: 'Dashboard', icon: () => <div>📊</div> },
    { id: 'tab2', label: 'Analytics', icon: () => <div>📈</div> },
    { id: 'tab3', label: 'Campaigns', icon: () => <div>📢</div> },
    { id: 'tab4', label: 'Templates', icon: () => <div>📄</div> },
    { id: 'tab5', label: 'Settings', icon: () => <div>⚙️</div> }
  ];

  // Example with 6 tabs
  const sixTabs = [
    { id: 'tab1', label: 'Dashboard', icon: () => <div>📊</div> },
    { id: 'tab2', label: 'Analytics', icon: () => <div>📈</div> },
    { id: 'tab3', label: 'Campaigns', icon: () => <div>📢</div> },
    { id: 'tab4', label: 'Templates', icon: () => <div>📄</div> },
    { id: 'tab5', label: 'Users', icon: () => <div>👥</div> },
    { id: 'tab6', label: 'Settings', icon: () => <div>⚙️</div> }
  ];

  const [currentTabs, setCurrentTabs] = useState(fourTabs);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Navigation Tabs Responsive Demo</h1>
      
      {/* Tab Count Selector */}
      <div className="flex justify-center gap-4 mb-8">
        <button 
          onClick={() => setCurrentTabs(twoTabs)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          2 Tabs
        </button>
        <button 
          onClick={() => setCurrentTabs(threeTabs)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          3 Tabs
        </button>
        <button 
          onClick={() => setCurrentTabs(fourTabs)}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          4 Tabs
        </button>
        <button 
          onClick={() => setCurrentTabs(fiveTabs)}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          5 Tabs
        </button>
        <button 
          onClick={() => setCurrentTabs(sixTabs)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          6 Tabs
        </button>
      </div>

      {/* Current Navigation */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Current: {currentTabs.length} Tabs - {currentTabs.length === 2 ? 'Large Size' : 
          currentTabs.length === 3 ? 'Large Size' : 
          currentTabs.length === 4 ? 'Medium Size' : 
          currentTabs.length === 5 ? 'Compact Size' : 'Extra Compact Size'}
        </h2>
        
        <NavigationTabs 
          navigationTabs={currentTabs}
          activeNavTab={activeTab}
          setActiveNavTab={setActiveTab}
        />
        
        <div className="mt-4 text-center">
          <p className="text-gray-600">Active Tab: <strong>{activeTab}</strong></p>
        </div>
      </div>

      {/* Design Specifications */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Design Specifications by Tab Count:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <strong>2-3 Tabs:</strong><br/>
            • Height: h-10 (40px)<br/>
            • Text: text-[15px]<br/>
            • Icons: 32x32px<br/>
            • Layout: basis-1/2 or basis-1/3
          </div>
          <div className="bg-green-50 p-3 rounded">
            <strong>4 Tabs:</strong><br/>
            • Height: h-9 (36px)<br/>
            • Text: text-[14px]<br/>
            • Icons: 30x30px<br/>
            • Layout: basis-1/4
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <strong>5 Tabs:</strong><br/>
            • Height: h-8 (32px)<br/>
            • Text: text-[13px]<br/>
            • Icons: 28x28px<br/>
            • Layout: basis-1/5
          </div>
          <div className="bg-orange-50 p-3 rounded">
            <strong>6+ Tabs:</strong><br/>
            • Height: h-8 (32px)<br/>
            • Text: text-[12px]<br/>
            • Icons: 26x26px<br/>
            • Layout: basis-1/6
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationDemo;
