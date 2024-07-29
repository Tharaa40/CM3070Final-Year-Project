# Final-Year-Project

Gamified task manager application

**MainTabs Function**: Defines the bottom tab navigator with all the tabs, including placeholders for the CreateTaskStack and TimerStack. These placeholders navigate to the respective stack navigators when selected.
**CreateTaskStack Function**: A stack navigator specifically for the CreateTask screen. This ensures that when navigating to CreateTask, the bottom tab navigator will be hidden.
**TimerStack Function**: A stack navigator specifically for the Timer screen. This ensures that when navigating to Timer, the bottom tab navigator will be hidden.
**App Function**: The root navigator includes the MainTabs screen as the primary navigator, encapsulating all other navigators.

**State Handling**: Introduced identifier to handle both email and username inputs.
**Async/Await**: Ensured the Firestore query and Firebase authentication calls are awaited.
**Toggle Login Method**: Used useUsername as a boolean to toggle between email and username login methods.
Testing:
**Username Login**: Toggle the switch to use the username, input a valid username and password, and attempt to log in.
**Email Login:** Leave the switch off, input a valid email and password, and attempt to log in.

**"expo-auth-session"**: "~5.5.2", -->
**"expo-crypto"**: "~13.0.2", --> peer dependency of expo-auth-session
**"expo-web-browser"**: "~13.0.3", --> web browser that we're opening when clicking on the "sign in with google"  
**"expo-application"**: "~5.9.1", --> peer dependency for android
**"expo-dev-client"**: "~4.0.20", --> build application and run on the simulator like how it will work in realtime
**"@react-native-async-storage/async-storage"**: "1.23.1" --> to save user information
