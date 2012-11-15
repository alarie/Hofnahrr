# no db used, but capistrano needs that, so it's in here
server "192.168.90.45", :app, :web, :db, :primary => true
set :user, "student"
set :deploy_to, "/home/student/hofnahrr/production"

set(:settings_file) { "#{deploy_to}/current/hofnahrr/public/js/settings.js" }
set(:base_url) { "http://192.168.90.45:8080/" }
