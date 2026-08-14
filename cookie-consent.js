(function () {
  var GA_MEASUREMENT_ID = "G-6868GEDEKB";
  var STORAGE_KEY = "wae_cookie_consent";
  var COOKIE_DAYS = 365;
  var gaLoaded = false;
  var handledByTCF = false;

  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[2]) : null;
  }
  function setCookie(name, value, days) {
    var expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + encodeURIComponent(value) +
      "; expires=" + expires.toUTCString() +
      "; path=/; SameSite=Lax";
  }

  function getConsent() {
    var fromCookie = getCookie(STORAGE_KEY);
    if (fromCookie) return fromCookie;
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function setConsent(value) {
    setCookie(STORAGE_KEY, value, COOKIE_DAYS);
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
  }

  function loadGoogleAnalytics() {
    if (gaLoaded) return;
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.indexOf("XXXXXXXXXX") !== -1) {
      return;
    }
    gaLoaded = true;

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
  }

  function hideOwnBanner() {
    var banner = document.getElementById("cookie-banner");
    if (banner) banner.classList.remove("show");
  }

  function listenToTCF() {
    if (typeof window.__tcfapi !== "function") return false;

    handledByTCF = true;
    hideOwnBanner();

    window.__tcfapi("addEventListener", 2, function (tcData, success) {
      if (!success || !tcData) return;

      if (tcData.gdprApplies === false) {
        setConsent("accepted");
        loadGoogleAnalytics();
        return;
      }

      if (tcData.eventStatus !== "tcloaded" && tcData.eventStatus !== "useractioncomplete") {
        return;
      }

      var purposeConsents = tcData.purpose && tcData.purpose.consents;
      var consented = !!(purposeConsents && purposeConsents["1"]);

      if (consented) {
        setConsent("accepted");
        loadGoogleAnalytics();
      } else {
        setConsent("rejected");
      }
    });

    return true;
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (listenToTCF()) return;

    var attempts = 0;
    var maxAttempts = 20;
    var poll = setInterval(function () {
      attempts++;
      if (listenToTCF() || attempts >= maxAttempts) {
        clearInterval(poll);
        if (!handledByTCF) {
          runFallbackBanner();
        }
      }
    }, 200);
  });

  function runFallbackBanner() {
    var existingConsent = getConsent();

    if (existingConsent === "accepted") {
      loadGoogleAnalytics();
    }

    var banner = document.getElementById("cookie-banner");
    if (!banner) return;

    if (!existingConsent) {
      banner.classList.add("show");
    }

    var acceptBtn = document.getElementById("cookie-accept");
    var rejectBtn = document.getElementById("cookie-reject");

    if (acceptBtn) {
      acceptBtn.addEventListener("click", function () {
        setConsent("accepted");
        loadGoogleAnalytics();
        banner.classList.remove("show");
      });
    }
    if (rejectBtn) {
      rejectBtn.addEventListener("click", function () {
        setConsent("rejected");
        banner.classList.remove("show");
      });
    }
  }
})();
