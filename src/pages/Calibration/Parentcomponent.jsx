import { Outlet } from 'react-router-dom';

const Parentcomponent = () => {
  const contextValue = {
    searchTerm: 'exampleSearchTerm', // your logic here
    isSearchTriggered: true, // or false depending on your state
  };

  return (
    <div>
      {/* Your layout or other components */}
      <Outlet context={contextValue} />
    </div>
  );
};

export default Parentcomponent;