<script lang="ts">
  const appName = "SubsManager";
  const contactEmail = "managesubsapp@gmail.com";
  const youtubeTermsUrl = "https://www.youtube.com/t/terms";
  const googlePrivacyUrl = "http://www.google.com/policies/privacy";
</script>

<section class="max-w-3xl mx-auto px-6 py-12 text-foreground">
  <h1 class="text-4xl font-bold mb-6">Terms of Use</h1>

  <div class="space-y-8 leading-relaxed">
    <div>
      <h2 class="text-2xl font-semibold mb-3">Acceptance of Terms</h2>
      <p>
        By accessing or using {appName}, you agree to these Terms of Use. In addition,
        because {appName} integrates with YouTube features, you acknowledge and agree that by
        using {appName} you are bound by the
        <a href={youtubeTermsUrl} target="_blank" class="text-blue-600 underline">YouTube Terms of Service</a>.
      </p>
      <p class="mt-2">
        {appName} uses <strong>YouTube API Services</strong>. Please also review the
        <a href={googlePrivacyUrl} target="_blank" class="text-blue-600 underline">Google Privacy Policy</a> and
        our <a href="/privacy" class="text-blue-600 underline">Privacy Policy</a> to understand how your
        information is handled.
      </p>
    </div>

    <div>
      <h2 class="text-2xl font-semibold mb-3">Permitted Use</h2>
      <p>
        You may use {appName} only for lawful purposes and in accordance with these Terms,
        the YouTube Terms of Service, and applicable policies. You are responsible for your
        actions within the app and must not attempt to circumvent YouTube or Google policies
        or security measures.
      </p>
    </div>

    <div>
      <h2 class="text-2xl font-semibold mb-3">Privacy and Data</h2>
      <p>
        Details about the data we access, how we use it, how long we store it, and how you
        can request deletion or revoke access are described in our
        <a href="/privacy" class="text-blue-600 underline">Privacy Policy</a>.
      </p>
    </div>

    <div>
      <h2 class="text-2xl font-semibold mb-3">Changes</h2>
      <p>
        We may update these Terms from time to time. Material changes will be posted on
        this page with an updated effective date. Your continued use of {appName} after
        changes become effective constitutes acceptance of the updated Terms.
      </p>
    </div>

    <div>
      <h2 class="text-2xl font-semibold mb-3">Contact</h2>
      <p>
        If you have questions about these Terms, contact us at {contactEmail}.
      </p>
    </div>
  </div>
</section>


