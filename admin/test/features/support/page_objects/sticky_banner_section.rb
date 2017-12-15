class StickyBannerSection < SitePrism::Section

  element :count, '.grid-row .column-half.first-half'
    element :cancel, '#stickyCancel'
    element :confirm, '#stickyConfirm'
  element :selected_pupil_count, '#totalPupilsSelected'

end