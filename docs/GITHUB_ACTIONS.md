# GitHub Actions Workflows Documentation

This repository includes comprehensive GitHub Actions workflows for automated building, testing, releasing, and maintaining your AI Agent Android application.

## 🚀 Available Workflows

### 1. Build Android APK (`build-android.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- New tags (e.g., `v1.0.0`)
- Pull requests to `main`
- Manual workflow dispatch

**Features:**
- ✅ Automated APK builds (debug & release)
- ✅ Cordova/PhoneGap integration
- ✅ Android signing for release builds
- ✅ Termux package creation
- ✅ Artifact upload and GitHub Releases
- ✅ Mobile-optimized configuration

**Build Types:**
- **Debug**: For development and testing
- **Release**: Signed APK for production distribution

**Outputs:**
- APK files for Android devices
- Termux `.deb` packages
- GitHub Releases with automatic versioning

### 2. Test and Quality Assurance (`test-quality.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main`
- Weekly schedule (Mondays at 2 AM)

**Test Categories:**
- ✅ **Lint & Format**: ESLint and Prettier checks
- ✅ **Unit Tests**: Component and utility testing
- ✅ **Integration Tests**: API and database testing
- ✅ **Security Audit**: Vulnerability scanning
- ✅ **Performance Tests**: Lighthouse CI analysis
- ✅ **Mobile Compatibility**: Responsive design testing

**Quality Gates:**
- Code must pass all linting rules
- Test coverage minimum: 80%
- Performance score minimum: 80
- Accessibility score minimum: 90

### 3. Release and Deploy (`release.yml`)

**Triggers:**
- New version tags (e.g., `v1.0.0`)
- Manual workflow dispatch

**Release Process:**
1. **Version Detection**: Automatic tag parsing
2. **Changelog Generation**: Git history analysis
3. **Release Creation**: GitHub Release with notes
4. **Asset Building**: APK and package creation
5. **Documentation**: Auto-deploy to GitHub Pages
6. **Notifications**: Success/failure alerts

**Release Assets:**
- `agented-{version}-debug.apk` - Debug APK
- `agented-{version}-release.apk` - Signed release APK
- `agented-termux-{version}.deb` - Termux package
- Source code archive

### 4. Dependency Updates and Maintenance (`maintenance.yml`)

**Triggers:**
- Weekly schedule (Mondays at 6 AM)
- Manual workflow dispatch

**Maintenance Tasks:**
- ✅ **Dependency Updates**: Automated package updates
- ✅ **Security Scanning**: Vulnerability detection
- ✅ **Code Quality**: Complexity and style analysis
- ✅ **Database Maintenance**: Schema validation and optimization
- ✅ **Performance Monitoring**: Bundle analysis and optimization

**Automated PRs:**
- Dependency update pull requests
- Security vulnerability reports
- Code quality improvement suggestions

## 🔧 Configuration

### Required Secrets

Add these secrets to your GitHub repository settings:

1. **`KEYSTORE_PASSWORD`** - Android keystore password for signing release APKs
2. **`KEY_PASSWORD`** - Android key password for signing
3. **`GITHUB_TOKEN`** - Automatically provided by GitHub Actions
4. **`SNYK_TOKEN`** - For Snyk security scanning (optional)
5. **`LHCI_GITHUB_APP_TOKEN`** - For Lighthouse CI (optional)

### Environment Variables

The workflows use these environment variables:

```yaml
NODE_VERSION: '18'
JAVA_VERSION: '17'
FLUTTER_VERSION: '3.16.0'  # Future use
```

## 📱 APK Building Process

### Prerequisites
- Node.js 18+
- Java 17
- Android SDK
- Cordova/PhoneGap

### Build Steps
1. **Setup Environment**: Install Node.js, Bun, Java, Android SDK
2. **Install Dependencies**: `bun install`
3. **Build Web App**: `bun run build`
4. **Create Cordova Project**: Initialize Android project
5. **Configure Permissions**: Set Android manifest permissions
6. **Copy Assets**: Move built web files to Android project
7. **Build APK**: Generate debug or release APK
8. **Sign APK**: Sign release APK with keystore
9. **Upload**: Attach to GitHub Release

### Android Permissions Included
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.VIBRATE" />
```

## 🧪 Testing Strategy

### Unit Tests
- Component testing with Vitest
- Utility function testing
- Hook testing
- Mock implementations

### Integration Tests
- API endpoint testing
- Database operations
- WebSocket connections
- File system operations

### Mobile Testing
- Android emulator testing
- Responsive design validation
- Touch interaction testing
- Accessibility compliance

### Performance Testing
- Lighthouse CI scores
- Bundle size analysis
- Load testing with Artillery
- Memory usage monitoring

## 📊 Quality Metrics

### Code Quality
- ESLint rules enforcement
- Prettier formatting
- TypeScript strict mode
- Code complexity analysis

### Security
- npm audit for vulnerabilities
- Snyk security scanning
- CodeQL static analysis
- Dependency monitoring

### Performance
- Lighthouse scores (Performance, Accessibility, Best Practices, SEO)
- Bundle size tracking
- Load time monitoring
- Memory usage analysis

## 🔄 Release Process

### Automated Release (Tags)
1. Create and push a version tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. GitHub Actions will automatically:
   - Build debug and release APKs
   - Create GitHub Release
   - Generate changelog
   - Deploy documentation
   - Notify completion

### Manual Release
1. Go to Actions tab in GitHub
2. Select "Release and Deploy" workflow
3. Click "Run workflow"
4. Enter version and release notes
5. Wait for completion

### Release Assets
After release completion, you'll find:
- APK files in the GitHub Release
- Termux package in the GitHub Release
- Documentation at `https://tiar430.github.io/agented/docs/`
- Source code archive in the release

## 🛠️ Local Development

### Running Tests Locally
```bash
# Install dependencies
bun install

# Run all tests
bun test

# Run specific test types
bun run test:unit
bun run test:integration
bun run test:api

# Run with coverage
bun run test:coverage
```

### Building APK Locally
```bash
# Build web application
bun run build

# Run Android build script
chmod +x build-android.sh
./build-android.sh
```

### Code Quality Checks
```bash
# Lint code
bun run lint

# Format code
bun run format

# Type checking
bun run type-check

# Security audit
bun run audit
```

## 📈 Monitoring and Alerts

### Workflow Status
- All workflows report success/failure status
- Artifacts are retained for 30 days
- Security reports are uploaded as artifacts
- Performance metrics are tracked over time

### Notifications
- Release success/failure notifications
- Security vulnerability alerts
- Dependency update PR notifications
- Performance regression alerts

## 🔍 Troubleshooting

### Common Issues

**Build Failures:**
- Check Node.js and Java versions
- Verify Android SDK installation
- Ensure sufficient disk space
- Review workflow logs for specific errors

**Test Failures:**
- Update test snapshots if needed
- Check mock implementations
- Verify test environment setup
- Review recent code changes

**Release Issues:**
- Verify tag format (vX.Y.Z)
- Check secrets configuration
- Ensure proper version increment
- Review release notes formatting

### Debugging Tips
1. **Check Workflow Logs**: Detailed logs for each step
2. **Download Artifacts**: Examine build outputs
3. **Local Reproduction**: Run failed steps locally
4. **GitHub Actions Docs**: Reference official documentation

## 🚀 Best Practices

### Development Workflow
1. Create feature branches from `develop`
2. Run tests locally before pushing
3. Create pull requests to `main`
4. Review automated test results
5. Merge after approval

### Release Management
1. Use semantic versioning (vX.Y.Z)
2. Write descriptive release notes
3. Test release candidates thoroughly
4. Monitor post-release performance

### Security
1. Regularly update dependencies
2. Review security scan results
3. Keep secrets secure
4. Follow principle of least privilege

---

For more information, refer to the [GitHub Actions Documentation](https://docs.github.com/en/actions) and the specific workflow files in `.github/workflows/`.