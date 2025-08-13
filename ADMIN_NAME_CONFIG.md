# 👤 Admin Name Configuration Guide

## 🎯 Overview

এই guide এ আমি explain করব কিভাবে Real Telegram Chat interface এ admin এর name customize করতে হবে।

## ✨ Features

- **Custom Admin Name**: Header এ admin এর নাম show করে
- **Dynamic Display**: Bot info থেকে automatically name নেয়
- **Fallback Support**: Default name যদি custom name না থাকে
- **Personalized Experience**: Users জানতে পারে কার সাথে chat করছে

## 🔧 Configuration Options

### Option 1: Direct Component Props

```tsx
<RealTelegramChat
  botToken={import.meta.env.VITE_TELEGRAM_BOT_TOKEN}
  chatId={import.meta.env.VITE_TELEGRAM_CHAT_ID}
  isOpen={isChatOpen}
  onClose={() => setIsChatOpen(false)}
  adminName="আপনার নাম" // Custom admin name
/>
```

### Option 2: Through FloatingChatButton

```tsx
<FloatingChatButton 
  botUsername="mushfiqmoon" 
  adminName="আপনার নাম" // Custom admin name
/>
```

### Option 3: Environment Variable

```env
# .env.local file এ add করুন
VITE_ADMIN_NAME=আপনার নাম
```

## 🎨 Display Priority

Admin name display করার priority order:

1. **Custom Admin Name** (props থেকে)
2. **Bot First Name** (Telegram API থেকে)
3. **Default Name** ("Admin")

## 📱 UI Changes

### Header Display
- **Before**: "Real Telegram Chat"
- **After**: "Chat with [Admin Name]"

### Icon Change
- **Before**: Bot icon
- **After**: User icon (👤)

### Footer Text
- **Before**: "Real-time chat with Telegram Bot API"
- **After**: "Real-time chat with [Admin Name]"

## 🔄 Dynamic Updates

### Bot Info Integration
- Bot connection এর সাথে automatically bot info fetch করে
- Bot এর first name use করে যদি custom name না থাকে
- Real-time updates support করে

### Fallback System
- Custom name না থাকলে bot name use করে
- Bot name না থাকলে default "Admin" use করে
- Error handling সহ robust system

## 🎯 Implementation Examples

### Example 1: Simple Custom Name

```tsx
<FloatingChatButton 
  botUsername="mushfiqmoon" 
  adminName="Mushfiq" 
/>
```

**Result**: Header এ "Chat with Mushfiq" দেখাবে

### Example 2: Bengali Name

```tsx
<FloatingChatButton 
  botUsername="mushfiqmoon" 
  adminName="মুশফিক" 
/>
```

**Result**: Header এ "Chat with মুশফিক" দেখাবে

### Example 3: Full Name

```tsx
<FloatingChatButton 
  botUsername="mushfiqmoon" 
  adminName="Mushfiq Rahman" 
/>
```

**Result**: Header এ "Chat with Mushfiq Rahman" দেখাবে

### Example 4: With Title

```tsx
<FloatingChatButton 
  botUsername="mushfiqmoon" 
  adminName="Mushfiq (Developer)" 
/>
```

**Result**: Header এ "Chat with Mushfiq (Developer)" দেখাবে

## 🌐 Internationalization Support

### Bengali Names
```tsx
adminName="মুশফিক রহমান"
```

### Arabic Names
```tsx
adminName="مشفق الرحمن"
```

### Hindi Names
```tsx
adminName="मुशफिक रहमान"
```

### Any Language
```tsx
adminName="Your Name in Any Language"
```

## 🔧 Advanced Configuration

### Dynamic Admin Name

```tsx
const [adminName, setAdminName] = useState("Mushfiq");

// Change admin name dynamically
const changeAdminName = (newName: string) => {
  setAdminName(newName);
};

<FloatingChatButton 
  botUsername="mushfiqmoon" 
  adminName={adminName} 
/>
```

### Multiple Admin Support

```tsx
const getAdminName = (adminId: string) => {
  const admins = {
    'admin1': 'Mushfiq',
    'admin2': 'Rahman',
    'admin3': 'Developer'
  };
  return admins[adminId] || 'Admin';
};

<FloatingChatButton 
  botUsername="mushfiqmoon" 
  adminName={getAdminName(currentAdminId)} 
/>
```

### Time-based Names

```tsx
const getTimeBasedName = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Mushfiq (Morning)";
  if (hour < 17) return "Mushfiq (Afternoon)";
  return "Mushfiq (Evening)";
};

<FloatingChatButton 
  botUsername="mushfiqmoon" 
  adminName={getTimeBasedName()} 
/>
```

## 📊 Benefits

### User Experience
- **Personal Connection**: Users জানতে পারে কার সাথে chat করছে
- **Trust Building**: Real person এর সাথে chat করার feeling
- **Professional Image**: Branded experience

### Technical Benefits
- **Flexible Configuration**: Easy to change names
- **Dynamic Updates**: Real-time name changes
- **Fallback Support**: Robust error handling

## 🚨 Important Notes

### Security
- Admin name public information, sensitive data না
- Real names use করা safe
- Username/password never expose করবেন না

### Performance
- Name changes instant effect
- No additional API calls
- Minimal performance impact

### Compatibility
- All modern browsers support
- Mobile responsive
- Accessibility friendly

## 🔍 Troubleshooting

### Name Not Showing
1. Check props passing correctly
2. Verify component import
3. Check console for errors

### Default Name Showing
1. Verify adminName prop value
2. Check prop type (string)
3. Ensure no empty string

### Bot Name Override
1. Bot info fetch check করুন
2. API response verify করুন
3. Network connectivity check করুন

## ✅ Best Practices

### Naming Conventions
- **Professional**: "Mushfiq Rahman"
- **Friendly**: "Mushfiq"
- **Branded**: "Mushfiq (BotCraft)"
- **Descriptive**: "Mushfiq - Web Developer"

### Dynamic Updates
- User preferences থেকে name load করুন
- Database থেকে name fetch করুন
- Admin panel থেকে name change করুন

### Error Handling
- Invalid names handle করুন
- Empty names fallback করুন
- Special characters support করুন

---

## 🎯 Quick Setup

### Step 1: Update Component
```tsx
<FloatingChatButton 
  botUsername="your_bot_username" 
  adminName="আপনার নাম" 
/>
```

### Step 2: Test Display
- Chat interface open করুন
- Header এ name check করুন
- Footer text verify করুন

### Step 3: Customize
- Different names test করুন
- Special characters try করুন
- Dynamic updates implement করুন

---

**🎉 Admin name configuration complete!**

এখন আপনার chat interface এ personalized admin name show হবে! 🚀✨ 