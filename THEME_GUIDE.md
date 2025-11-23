# Dark/Light Mode & Animation Guide

## 🎨 Tính năng đã thêm

### 1. Dark/Light Mode Toggle
- **ThemeContext**: Context API quản lý theme state
- **Toggle button**: Nút chuyển đổi theme ở Navbar và EmailGate
- **LocalStorage**: Lưu preference của user
- **Auto-apply**: Theme được apply tự động khi load page

### 2. Animations
- **fadeIn**: Fade in từ dưới lên (0.5s)
- **slideDown**: Slide down từ trên xuống (0.3s)
- **scaleIn**: Scale từ nhỏ lên (0.3s)
- **pulse-slow**: Pulse effect chậm (2s)
- **Hover effects**: Scale, shadow, translate trên các buttons và cards

### 3. Các component đã update

#### ThemeContext (`src/context/ThemeContext.jsx`)
```jsx
import { useTheme } from '../context/ThemeContext';
const { theme, toggleTheme } = useTheme();
```

#### Tailwind Classes
- Light mode: `bg-white text-gray-900`
- Dark mode: `dark:bg-gray-800 dark:text-white`
- Transitions: `transition-colors duration-300`

### 4. Cách sử dụng

#### Toggle Theme Button
```jsx
<button onClick={toggleTheme}>
  {theme === 'light' ? <Moon /> : <Sun />}
</button>
```

#### Dark Mode Classes
```jsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content
</div>
```

#### Animations
```jsx
<div className="animate-fadeIn">Fade in content</div>
<div className="animate-scaleIn">Scale in content</div>
<div className="animate-slideDown">Slide down content</div>
```

### 5. Color Palette

#### Light Mode
- Background: `bg-gray-50`, `bg-white`
- Text: `text-gray-900`, `text-gray-600`
- Primary: `bg-qnu-500` (#005BBB)
- Borders: `border-gray-100`

#### Dark Mode
- Background: `dark:bg-gray-900`, `dark:bg-gray-800`
- Text: `dark:text-white`, `dark:text-gray-300`
- Primary: `dark:bg-blue-600`
- Borders: `dark:border-gray-700`

### 6. Best Practices

1. **Always add transitions**: `transition-all duration-300`
2. **Hover effects**: `hover:scale-105 hover:shadow-xl`
3. **Active states**: `active:scale-95`
4. **Focus rings**: `focus:ring-2 focus:ring-qnu-500 dark:focus:ring-blue-500`
5. **Stagger animations**: Use `style={{ animationDelay: \`\${index * 0.1}s\` }}`

### 7. Components với Dark Mode

✅ App.jsx
✅ ThemeContext.jsx
✅ Navbar.jsx
✅ EmailGate.jsx
✅ Footer.jsx
✅ Loader.jsx
✅ WalletConnect.jsx
✅ CandidateCard.jsx
✅ Home.jsx
✅ Voting.jsx
✅ Claim.jsx
✅ Admin.jsx

### 8. Testing

1. Click nút Moon/Sun icon để toggle theme
2. Refresh page - theme preference được giữ
3. Check tất cả pages: Home, Claim, Vote, Admin
4. Test responsive trên mobile
5. Check animations khi load page và hover

### 9. Customization

Để thay đổi colors, edit `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      qnu: {
        500: '#005BBB',
        600: '#004a99',
      },
    },
  },
}
```

Để thêm animations mới, edit `src/index.css`:
```css
@keyframes yourAnimation {
  from { ... }
  to { ... }
}
```
