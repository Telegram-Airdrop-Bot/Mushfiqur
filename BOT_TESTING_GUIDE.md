# 🧪 Real Telegram Bot API Testing Guide

## 🎯 Quick Test Setup

### Step 1: Environment Variables
Create `.env.local` file in your project root:

```env
VITE_TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
VITE_TELEGRAM_BOT_USERNAME=mushfiq_website_bot
VITE_TELEGRAM_CHAT_ID=123456789
```

### Step 2: Test Bot Creation
1. **Go to @BotFather** on Telegram
2. **Send `/newbot`**
3. **Choose name**: "Test Website Bot"
4. **Choose username**: `test_website_bot`
5. **Save the token**

### Step 3: Get Chat ID
1. **Start chat with your bot**
2. **Send any message** (e.g., "Hello")
3. **Visit this URL** (replace with your token):
   ```
   https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
   ```
4. **Find chat.id** in the response

## 🚀 Testing Steps

### 1. Connection Test
- Open chat interface
- Check connection status
- Should show "Connected" with green dot

### 2. Message Sending Test
- Type a message
- Click send
- Check if message appears
- Verify no errors

### 3. Message Receiving Test
- Send message from Telegram app
- Check if it appears in website
- Verify real-time updates

### 4. Error Handling Test
- Disconnect internet
- Try to send message
- Check error display
- Reconnect and retry

## 🔍 Debug Information

### Console Logs
Check browser console for:
- Connection status
- API responses
- Error messages
- Polling updates

### Network Tab
Monitor network requests:
- API calls to Telegram
- Response status codes
- Request/response data

### Common Issues

#### 1. "Bot connection failed"
- Check bot token
- Verify bot is active
- Check @BotFather status

#### 2. "Failed to send message"
- Check chat ID
- Verify bot permissions
- Check rate limiting

#### 3. "Failed to fetch messages"
- Check internet connection
- Verify API endpoint
- Check bot blocking

## 📱 Mobile Testing

### Telegram App Integration
1. **Open website in Telegram**
2. **Check Web App features**
3. **Test haptic feedback**
4. **Verify theme sync**

### Browser Fallback
1. **Open in regular browser**
2. **Test fallback functionality**
3. **Verify error handling**
4. **Check responsive design**

## 🎨 UI Testing

### Visual Elements
- Connection status indicator
- Error message display
- Loading states
- Message bubbles
- Input field behavior

### Responsive Design
- Desktop layout
- Mobile layout
- Tablet layout
- Different screen sizes

## 🔒 Security Testing

### Token Exposure
- Check source code
- Verify environment variables
- Test production build
- Check network requests

### Input Validation
- Test special characters
- Test long messages
- Test empty messages
- Test malicious input

## 📊 Performance Testing

### Load Testing
- Multiple messages
- High frequency sending
- Large message content
- Concurrent users

### Memory Usage
- Long chat sessions
- Message history
- Component cleanup
- Memory leaks

## 🚨 Error Scenarios

### Network Issues
- Slow connection
- Intermittent connection
- No connection
- Connection timeout

### API Issues
- Invalid token
- Rate limiting
- Server errors
- Timeout errors

### User Errors
- Invalid input
- Empty messages
- Special characters
- Long messages

## ✅ Success Criteria

### Connection
- [ ] Bot connects successfully
- [ ] Status shows "Connected"
- [ ] No connection errors
- [ ] Retry button works

### Messaging
- [ ] Messages send successfully
- [ ] Messages receive in real-time
- [ ] No message errors
- [ ] Loading states work

### Error Handling
- [ ] Errors display properly
- [ ] Error messages clear
- [ ] Retry functionality works
- [ ] Fallback behavior works

### UI/UX
- [ ] Interface loads properly
- [ ] Responsive design works
- [ ] Animations smooth
- [ ] Accessibility features work

## 🔄 Continuous Testing

### Daily Tests
- Basic functionality
- Connection status
- Message sending/receiving

### Weekly Tests
- Error scenarios
- Performance metrics
- Security checks

### Monthly Tests
- Full feature testing
- Load testing
- Security audit

## 📞 Support

### When Tests Fail
1. **Check console logs**
2. **Verify environment variables**
3. **Test API endpoints directly**
4. **Check bot status**
5. **Review error messages**

### Getting Help
- Check this guide
- Review Telegram documentation
- Check browser console
- Test with simple examples

---

**Happy Testing! 🎉**

Remember: Test early, test often, test everything! 🧪✅ 