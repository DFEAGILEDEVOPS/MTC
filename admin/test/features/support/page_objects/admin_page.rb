class AdminPage < SitePrism::Page
  set_url '/administrator'

  element :check_settings, "a[href='/administrator/check-settings']"
end
