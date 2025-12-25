// Test script to verify Phase 5 sign language detection
// Run this from browser console on the sign language page

console.log('🧪 Phase 5 Sign Language Detection Test Suite');
console.log('================================================\n');

// Test 1: Check MediaPipe loaded
function test1_MediaPipeLoaded() {
  console.log('Test 1: MediaPipe Library Check');
  try {
    if (window.MediaPipeHandLandmarker || window.HandLandmarker) {
      console.log('✅ PASS: MediaPipe is available');
      return true;
    } else {
      console.log('❌ FAIL: MediaPipe not loaded');
      return false;
    }
  } catch (e) {
    console.log('⚠️ WARNING: Cannot verify MediaPipe', e.message);
    return false;
  }
}

// Test 2: Check webcam access
function test2_WebcamAccess() {
  console.log('\nTest 2: Webcam Access Check');
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      console.log('✅ PASS: Webcam access granted');
      stream.getTracks().forEach(track => track.stop());
      return true;
    })
    .catch(err => {
      console.log('❌ FAIL: Webcam access denied -', err.message);
      return false;
    });
}

// Test 3: Check required React components
function test3_ComponentsExist() {
  console.log('\nTest 3: Component Files Check');
  const files = [
    'SignLanguageDetector component',
    'gestureRecognition utility',
    'SignLanguage page'
  ];
  console.log('✅ Expected components:', files);
  console.log('Note: Check browser network tab for component loading');
}

// Test 4: Performance check
function test4_Performance() {
  console.log('\nTest 4: Performance Metrics');
  console.log('Expected FPS: 25-30');
  console.log('Expected Latency: < 100ms');
  console.log('Check FPS counter on the page (top-right of video)');
}

// Test 5: Gesture detection
function test5_GestureDetection() {
  console.log('\nTest 5: Gesture Detection Manual Test');
  console.log('Try these gestures in order:');
  console.log('  1. ✊ Make a fist (should detect "A")');
  console.log('  2. ✌️ Peace sign (should detect "V")');
  console.log('  3. 🖐️ Open hand (should detect "5")');
  console.log('  4. 🤟 L shape (should detect "L")');
  console.log('  5. 🤘 Pinky up (should detect "I")');
  console.log('\nExpected output in text area: "AV5LI"');
}

// Test 6: UI Features
function test6_UIFeatures() {
  console.log('\nTest 6: UI Features Check');
  const features = [
    '□ Camera enable/disable toggle',
    '□ Clear text button',
    '□ Delete last character button',
    '□ Copy to clipboard',
    '□ Download history',
    '□ Detection history sidebar',
    '□ Session statistics',
    '□ FPS counter display',
    '□ Gesture confidence display'
  ];
  console.log('Verify these features are present:');
  features.forEach(f => console.log('  ' + f));
}

// Test 7: Browser compatibility
function test7_BrowserCompatibility() {
  console.log('\nTest 7: Browser Compatibility');
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  
  if (ua.includes('Chrome')) browser = 'Chrome ✅ (Recommended)';
  else if (ua.includes('Firefox')) browser = 'Firefox ✅';
  else if (ua.includes('Safari')) browser = 'Safari ⚠️ (May have issues)';
  else if (ua.includes('Edge')) browser = 'Edge ✅';
  
  console.log('Browser:', browser);
  console.log('WebGL Support:', !!document.createElement('canvas').getContext('webgl') ? '✅ Yes' : '❌ No');
  console.log('getUserMedia Support:', !!navigator.mediaDevices?.getUserMedia ? '✅ Yes' : '❌ No');
}

// Test 8: Check dependencies
function test8_Dependencies() {
  console.log('\nTest 8: Dependencies Check');
  console.log('Required npm packages:');
  console.log('  - @mediapipe/tasks-vision@0.10.8');
  console.log('  - react-webcam@7.2.0');
  console.log('Run: npm list | grep -E "(mediapipe|webcam)"');
}

// Run all tests
function runAllTests() {
  console.log('\n🏃 Running all tests...\n');
  test1_MediaPipeLoaded();
  test2_WebcamAccess();
  test3_ComponentsExist();
  test4_Performance();
  test5_GestureDetection();
  test6_UIFeatures();
  test7_BrowserCompatibility();
  test8_Dependencies();
  
  console.log('\n================================================');
  console.log('✅ Phase 5 Test Suite Complete!');
  console.log('📝 Manual testing required for gesture detection');
  console.log('================================================\n');
}

// Auto-run tests
runAllTests();

// Export test functions for manual use
window.phase5Tests = {
  runAll: runAllTests,
  test1_MediaPipeLoaded,
  test2_WebcamAccess,
  test3_ComponentsExist,
  test4_Performance,
  test5_GestureDetection,
  test6_UIFeatures,
  test7_BrowserCompatibility,
  test8_Dependencies
};

console.log('💡 Tip: Access individual tests via window.phase5Tests');
console.log('Example: window.phase5Tests.test2_WebcamAccess()');
