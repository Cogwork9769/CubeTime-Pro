import "@supabase/supabase-js"

declare module "@supabase/supabase-js" {
  export type Provider =
    | "apple"
    | "azure"
    | "bitbucket"
    | "discord"
    | "facebook"
    | "github"
    | "gitlab"
    | "google"
    | "keycloak"
    | "linkedin"
    | "notion"
    | "slack"
    | "spotify"
    | "twitch"
    | "twitter"
    | "zoom"
    | "wca"
}
