# no db used, but capistrano needs that, so it's in here
server "192.168.90.45", :app, :web, :db, :primary => true
set :user, "student"
set :deploy_to, "/home/student/hofnahrr/production"

set(:settings_file) { "#{deploy_to}/current/public/js/settings.js" }
set(:base_url) { "http://192.168.90.45:8080/" }

set :use_sudo, true
set :node_binary, "/usr/bin/node"

set :node_env, "production"
set :node_user, "student"

set :upstart_job_name, "hofnahrr"

set :app_command, "startup.js"
set :app_environment, "PORT=8080"

namespace :deploy do
    task :del do
        sudo "rm -rf #{release_path}/node_modules/deployd"
    end
end
after "deploy:create_symlink", "deploy:del"
