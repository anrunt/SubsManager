<script lang="ts">
  const appName = "SubsManager";
  const contactEmail = "managesubsapp@gmail.com";
  const youtubeTermsUrl = "https://www.youtube.com/t/terms";
  const googlePrivacyUrl = "http://www.google.com/policies/privacy";
  const googleSecuritySettingsUrl = "https://security.google.com/settings/";
</script>

<section class="max-w-3xl mx-auto px-6 py-12 text-foreground">
  <h1 class="text-4xl font-bold mb-6">Privacy Policy</h1>

  <div class="space-y-8 leading-relaxed">
    <div>
      <h2 class="text-2xl font-semibold mb-3">Overview</h2>
      <p>
        This Privacy Policy explains how {appName} accesses, uses, stores, and shares
        Google user data and other personal information. It applies together with any
        product-specific privacy disclosures shown in the app. Your use of Google user
        data is limited to the practices disclosed here and is designed to conform with
        Google's Limited Use requirements.
      </p>
      <p class="mt-2">
        This app uses <strong>YouTube API Services</strong>. By using {appName}, you agree to be bound by the
        <a href={youtubeTermsUrl} class="text-blue-600 underline" target="_blank">YouTube Terms of Service</a>.
        Please also review the <a href={googlePrivacyUrl} class="text-blue-600 underline" target="_blank">Google Privacy Policy</a>.
      </p>
    </div>

    <div>
      <h2 class="text-2xl font-semibold mb-3">Google API Compliance</h2>
      <p>
        Our use of information received from Google APIs adheres to 
        <a href="https://developers.google.com/terms/api-services-user-data-policy" 
           class="text-blue-600 underline" target="_blank">
          Google API Services User Data Policy
        </a>, including the Limited Use requirements. We only use your Google data 
        to provide the specific features visible in our application interface.
      </p>
      <p class="mt-2">
        Specifically, {appName} integrates with <strong>YouTube API Services</strong> to access your YouTube
        subscriptions solely for the purpose of displaying them and allowing you to remove
        subscriptions at your request.
      </p>
    </div>

    <div>
      <h2 class="text-2xl font-semibold mb-3">What data we access from Google</h2>
      <ul class="list-disc pl-6 space-y-1">
        <li>Google Account basic profile: Google user ID and display name (username).</li>
        <li>YouTube Data API: ability to list and manage your subscriptions in order to remove them on request.</li>
        <li>OAuth tokens: access token, refresh token, and access token expiry time.</li>
      </ul>
    </div>

    <div>
      <h2 class="text-2xl font-semibold mb-3">How we use the data</h2>
      <ul class="list-disc pl-6 space-y-1">
        <li>Authenticate you and maintain your session.</li>
        <li>Data is used solely to provide user-facing features visible in the application interface.</li>
        <li>No human reads your data unless you explicitly request support assistance.</li>
        <li>Retrieve your subscribed channels to display and allow bulk removal upon your action.</li>
        <li>Refresh access tokens when needed to complete requested actions.</li>
      </ul>
    </div>

    <div>
      <h2 class="text-2xl font-semibold mb-3">How we store the data</h2>
      <p>We store the following items in our database for up to 30 days to support your session:</p>
      <ul class="list-disc pl-6 space-y-1">
        <li>googleUserId</li>
        <li>username (Google display name)</li>
        <li>accessToken</li>
        <li>refreshToken</li>
        <li>accessTokenExpiresAt</li>
      </ul>
      <p class="mt-2">
        We also cache your current subscriptions for performance for up to 2 hours. The cache is automatically deleted after 2 hours.
      </p>
    </div>

    <div>
      <h2 class="text-2xl font-semibold mb-3">Sharing and transfers</h2>
      <p>
        We do not share Google user data or any personal information with third parties.
        We do not sell data. We do not transfer data internationally except as required
        by our hosting provider to operate the service. No backups of user data are made.
      </p>
    </div>

    <div>
      <h2 class="text-2xl font-semibold mb-3">Retention and deletion</h2>
      <p>
        Session data is retained for up to 30 days from your last activity and then
        automatically deleted. Subscription cache entries are retained for up to 2 hours
        and then automatically deleted. 
      </p>
      <p class="mt-2">
        You can request deletion of your session data at any time by contacting us or logging out and waiting for expiration.
        To request deletion: send an email to {contactEmail} from the email address
        associated with your Google Account used in {appName}. We will erase stored session
        records and tokens within 72 hours and confirm via email when completed.
      </p>
    </div>

    <div>
      <h2 class="text-2xl font-semibold mb-3">Your Rights</h2>
      <ul class="list-disc pl-6 space-y-1">
        <li>Request a copy of your stored data</li>
        <li>Request correction of inaccurate data</li>
        <li>Request immediate deletion of your data</li>
        <li>Withdraw consent at any time through Google Account settings</li>
      </ul>
    </div>

    <div>
      <h2 class="text-2xl font-semibold mb-3">User controls</h2>
      <ul class="list-disc pl-6 space-y-1">
        <li>
          Revoke {appName}'s access from your Google Account at any time via the Google security
          settings page: <a href={googleSecuritySettingsUrl} class="text-blue-600 underline" target="_blank">security.google.com/settings/</a>.
          You may also review and manage app access at <a href="https://myaccount.google.com/permissions" target="_blank" class="text-blue-600 underline">myaccount.google.com/permissions</a>.
        </li>
        <li>Log out in the app to end your current session.</li>
        <li>Contact us to request deletion of stored session data earlier than the retention period.</li>
      </ul>
    </div>

    <div>
      <h2 class="text-2xl font-semibold mb-3">Security</h2>
      <p>
        We take reasonable measures to protect your data during transit and at rest. OAuth
        tokens are stored server-side and never embedded in client code. Cookies are set as
        httpOnly where applicable.
      </p>
      <p>
        We implement industry-standard security measures including HTTPS encryption, 
        secure token storage, and regular security updates. Access to your data is 
        restricted to automated processes necessary for app functionality.
      </p>
    </div>

    <div>
      <h2 class="text-2xl font-semibold mb-3">Contact</h2>
      <p>
        If you have questions about this policy, contact us at {contactEmail}.
      </p>
      <p class="mt-2">
        See also our <a href="/terms" class="text-blue-600 underline">Terms of Use</a> for additional terms,
        including your agreement to the YouTube Terms of Service when using {appName}.
      </p>
    </div>
  </div>
</section>


