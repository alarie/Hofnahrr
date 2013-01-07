default_run_options[:pty] = true

set :application, "Hofnahrr"
# use git with the specified repository
set :scm, "git"
set :repository,  "https://github.com/alarie/Hofnahrr.git"
set :branch, "master"

# ssh stuff
# forward ssh login so rsa is used
set :ssh_options, { :forward_agent => true }

set :deploy_via, :remote_cache

# capistrano-ext options
set :stages, ["dev", "production"]
set :default_stage, "dev"

namespace :deploy do
    task :update_settings do
        settings = capture("cat #{settings_file}")

        settings.gsub!(/BASE_URL\s*:\s*'([^']+)'/m, "BASE_URL : '#{base_url}'")

        put(settings, settings_file)
    end
end
after "deploy:update", "deploy:update_settings"

namespace :deploy do
    task :change_current_path do
        set :current_path, "#{current_path}/hofnahrr"
        puts "current_path is now #{current_path}"
    end
end
 after "deploy:create_symlink", "deploy:change_current_path"

