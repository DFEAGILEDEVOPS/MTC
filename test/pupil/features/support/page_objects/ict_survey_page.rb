class IctSurveyPage < SitePrism::Page
  set_url 'ict-survey/start'

  element :heading, '.heading-xlarge', text: "Multiplication tables check ICT survey"
  element :purpose_message, '.lede', text: "The purpose of this survey is to help us understand the information and communications technology (ICT) used in schools."
  element :info_message_1, '.panel-border-wide p', text: "Please complete the survey using your school ICT. If you have a range of devices, complete the survey on them one at a time."
  element :info_message_2, '.column-two-thirds p', text: "Following the connection test, please give us feedback on any ICT issues you encounter."
  element :info_message_3, '.column-two-thirds p', text: "You will be able to preview the multiplication tables check system after the connections test."
  element :start_now_button, '.button-start'

  section :more_detail, 'details' do
    element :toggle, 'summary'
    element :ict_test_info, '.panel-border-narrow p', text: "This test will determine your:"
    element :ict_test_list_item1, '.panel-border-narrow ul li', text: 'browser settings'
    element :ict_test_list_item2, '.panel-border-narrow ul li', text: 'connection speed'
    element :ict_test_list_item3, '.panel-border-narrow ul li', text: 'device type (if available)'
    element :ict_test_list_item4, '.panel-border-narrow ul li', text: 'operating system'
    element :ict_test_list_item5, '.panel-border-narrow ul li', text: 'processing speed'
    element :ict_test_list_item6, '.panel-border-narrow ul li', text: 'screen width'
    element :ict_test_info2, '.panel-border-narrow p', text: "During this process, data files will be downloaded, held temporarily and then deleted. All data will be anonymised unless contact details are provided in your feedback"
  end

  element :footer_privacy_link, '.footer-wrapper .footer-meta .footer-meta-inner ul li a', text: "Privacy"
  element :footer_contact_link, '.footer-wrapper .footer-meta .footer-meta-inner ul li a', text: "Contact"
  element :footer_cookies_link, '.footer-wrapper .footer-meta .footer-meta-inner ul li a', text: "Cookies"
  element :footer_link, '.footer-wrapper .footer-meta .copyright a'
end