---
name: designing-android-apps
description: Designs adaptive Android applications using Jetpack Compose and Material Design 3. Use when the user asks to build Android app UI, Compose layouts, or implement Material 3 components.
---

# Android Mobile Design (Material 3 & Compose)

## When to use this skill
- Designing Android app interfaces following Material Design 3.
- Building Jetpack Compose UI and layouts.
- Implementing Android navigation patterns (Navigation Compose).
- Creating adaptive layouts for phones, tablets, and foldables.
- Using Material 3 theming with dynamic colors.
- Building accessible Android interfaces.
- Implementing Android-specific gestures and interactions.
- Designing for different screen configurations.

## Workflow
- [ ] **Architecture Planning**: Determine appropriate Compose layout components (Row, Column, Lazy grids based on item dynamic ranges).
- [ ] **Theming Setup**: Initialize `MaterialTheme` with dynamic coloring config and Typography schemas.
- [ ] **Navigation Definition**: Implement structured Navigation frameworks (Navigation Drawer vs. Bottom Nav).
- [ ] **Component Implementation**: Build isolated, state-hoisted Compose functions relying on standard Material 3 components.
- [ ] **Constraint Review**: Test touch targets (48dp minimum), layout responsiveness, and accessibility modifiers.

## Instructions

### 1. Material Design 3 Principles
* **Personalization**: Use dynamic color to adapt the UI to the user's wallpaper context natively.
* **Accessibility**: Use tonal palettes to ensure sufficient color contrast automatically.
* **Large Screens**: Ensure layouts are responsive for tablets and foldables.
* **Components**: Stick strictly to Material Defaults for major constructs: Cards, Buttons, FABs, Chips, Dialogs, Bottom Nav/Rail. 

### 2. Jetpack Compose Layout System
**Column and Row Examples:**
```kotlin
Column(
    modifier = Modifier.padding(16.dp),
    verticalArrangement = Arrangement.spacedBy(12.dp),
    horizontalAlignment = Alignment.Start
) {
    Text(text = "Title", style = MaterialTheme.typography.headlineSmall)
    Text(
        text = "Subtitle",
        style = MaterialTheme.typography.bodyMedium,
        color = MaterialTheme.colorScheme.onSurfaceVariant
    )
}

Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.SpaceBetween,
    verticalAlignment = Alignment.CenterVertically
) {
    Icon(Icons.Default.Star, contentDescription = null)
    Text("Featured")
    Spacer(modifier = Modifier.weight(1f))
    TextButton(onClick = {}) { Text("View All") }
}
```

**Lazy Lists and Grids:**
```kotlin
LazyColumn {
    items.groupBy { it.category }.forEach { (category, categoryItems) ->
        stickyHeader {
            Text(
                text = category,
                modifier = Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.surface).padding(16.dp),
                style = MaterialTheme.typography.titleMedium
            )
        }
        items(categoryItems) { item -> ItemRow(item = item) }
    }
}

LazyVerticalGrid(
    columns = GridCells.Adaptive(minSize = 150.dp),
    contentPadding = PaddingValues(16.dp),
    horizontalArrangement = Arrangement.spacedBy(12.dp),
    verticalArrangement = Arrangement.spacedBy(12.dp)
) {
    items(items) { item -> ItemCard(item = item) }
}
```

### 3. Navigation Patterns
It is best practice to pass nav actions down and hoist State, rather than passing NavControllers into nested Views.

**Bottom Navigation Example:**
```kotlin
@Composable
fun MainScreen() {
    val navController = rememberNavController()

    Scaffold(
        bottomBar = {
            NavigationBar {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentDestination = navBackStackEntry?.destination

                NavigationDestination.entries.forEach { destination ->
                    NavigationBarItem(
                        icon = { Icon(destination.icon, contentDescription = null) },
                        label = { Text(destination.label) },
                        selected = currentDestination?.hierarchy?.any { it.route == destination.route } == true,
                        onClick = {
                            navController.navigate(destination.route) {
                                popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = NavigationDestination.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(NavigationDestination.Home.route) { HomeScreen() }
            composable(NavigationDestination.Search.route) { SearchScreen() }
            composable(NavigationDestination.Profile.route) { ProfileScreen() }
        }
    }
}
```

### 4. Material 3 Theming
**Color Scheme Initialization:**
```kotlin
// Dynamic color (Android 12+) automatically falls back on custom schemes if unavailable
val dynamicColorScheme = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
    val context = LocalContext.current
    if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
} else {
    if (darkTheme) DarkColorScheme else LightColorScheme
}
```

### Best Practices & Common Jetpack Issues
1. **Adaptive Navigation & Theme**: Rely cleanly on `MaterialTheme.colorScheme` and `WindowSizeClass` rather than hardcoding native colors or breakpoints. Use `.weight(1f)` frequently.
2. **Recomposition Overload**: Avoid passing unstable lambdas down scopes; rely heavily on standard `remember` block mechanisms. Use `rememberSaveable` heavily to protect UI states against orientation/configuration changes.
3. **List Memory Leaks**: Always prefer `LazyColumn`/`LazyVerticalGrid` over looped Column/Rows for unbounded data. Ensure coroutines tied to a View are properly cancelled off UI lifecycle changes (e.g., inside `DisposableEffect`).

## Resources
- [Material Design 3](https://m3.material.io/)
- [Jetpack Compose Documentation](https://developer.android.com/jetpack/compose)
- [Compose Samples](https://github.com/android/compose-samples)
- [Material 3 Compose](https://developer.android.com/jetpack/compose/designsystems/material3)
