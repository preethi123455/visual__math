const styles = {
    // App layout
    appContainer: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      fontFamily: 'Poppins, sans-serif',
      color: '#333',
      background: '#f9f5ff'
    },
    mainContent: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden'
    },
    contentArea: {
      flex: 1,
      padding: '20px',
      overflowY: 'auto'
    },
    
    // Header styles
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 20px',
      background: 'linear-gradient(135deg, #6a0dad 0%, #9b59b6 100%)',
      color: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    headerTitle: {
      fontWeight: 'bold',
      fontSize: '1.8rem',
      margin: 0
    },
    controls: {
      display: 'flex',
      gap: '15px'
    },
    
    // Sidebar styles
    sidebar: {
      width: '240px',
      background: 'white',
      boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column'
    },
    navItem: {
      padding: '15px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      borderLeft: '4px solid transparent'
    },
    activeNavItem: {
      background: '#f0e6ff',
      borderLeft: '4px solid #6a0dad',
      color: '#6a0dad',
      fontWeight: '500'
    },
    
    // Card components
    card: {
      background: 'white',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      marginBottom: '20px'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    cardTitle: {
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#6a0dad',
      margin: 0
    },
    
    // Dashboard stats
    statsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      background: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 4px 8px rgba(106, 13, 173, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#6a0dad',
      margin: '10px 0'
    },
  
    // Button styles
    button: {
      backgroundColor: '#6a0dad',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease'
    },
    chatContainer: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    },
    chatMessages: {
      flex: 1,
      overflowY: 'auto',
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    messageUser: {
      alignSelf: 'flex-end',
      background: '#6a0dad',
      color: 'white',
      padding: '10px 15px',
      borderRadius: '18px 18px 0 18px',
      maxWidth: '70%'
    },
    messageBot: {
      alignSelf: 'flex-start',
      background: '#f0e6ff',
      color: '#333',
      padding: '10px 15px',
      borderRadius: '18px 18px 18px 0',
      maxWidth: '70%'
    }
  };
  
  export default styles;
  