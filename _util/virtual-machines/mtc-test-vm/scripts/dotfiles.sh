#!/bin/sh -eux

# Install dotfiles

cat > ~/.zshrc <<'ZSHRC'
# Set up the prompt

autoload -Uz promptinit
promptinit
prompt adam1

setopt histignorealldups sharehistory

# Use emacs keybindings even if our EDITOR is set to vi
bindkey -e

# Keep 1000 lines of history within the shell and save it to ~/.zsh_history:
HISTSIZE=1000
SAVEHIST=1000
HISTFILE=~/.zsh_history

# Use modern completion system
autoload -Uz compinit
compinit

zstyle ':completion:*' auto-description 'specify: %d'
zstyle ':completion:*' completer _expand _complete _correct _approximate
zstyle ':completion:*' format 'Completing %d'
zstyle ':completion:*' group-name ''
zstyle ':completion:*' menu select=2
eval "$(dircolors -b)"
zstyle ':completion:*:default' list-colors ${(s.:.)LS_COLORS}
zstyle ':completion:*' list-colors ''
zstyle ':completion:*' list-prompt %SAt %p: Hit TAB for more, or the character to insert%s
zstyle ':completion:*' matcher-list '' 'm:{a-z}={A-Z}' 'm:{a-zA-Z}={A-Za-z}' 'r:|[._-]=* r:|=* l:|=*'
zstyle ':completion:*' menu select=long
zstyle ':completion:*' select-prompt %SScrolling active: current selection at %p%s
zstyle ':completion:*' use-compctl false
zstyle ':completion:*' verbose true

zstyle ':completion:*:*:kill:*:processes' list-colors '=(#b) #([0-9]#)*=0=01;31'
zstyle ':completion:*:kill:*' command 'ps -u $USER -o pid,%cpu,tty,cputime,cmd'

alias yys='yarn install && yarn start'
alias ll='ls -al'
alias lt='ls -altr'


export PATH=$PATH:$HOME/bin
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion


[ -s "$HOME/.rvm/scripts/rvm" ] && source "$HOME/.rvm/scripts/rvm"
ZSHRC
chown $SUDO_USER ~/.zshrc

cat > ~/.tmux.conf <<'TMUX'
# remap prefix from 'C-b' to 'C-z'
set -g prefix C-j
unbind-key C-b
 bind-key C-j send-prefix

# Enable mouse mode (tmux 2.1 and above)
set -g mouse on

# Copy/Paste integration
# Taken from https://evertpot.com/osx-tmux-vim-copy-paste-clipboard/
# Copy-paste integration
# set-option -g default-command "reattach-to-user-namespace -l bash"

# Use vim keybindings in copy mode
setw -g mode-keys vi

# Setup 'v' to begin selection as in Vim
bind-key -T copy-mode-vi v send-keys -X begin-selection
#bind-key -T copy-mode-vi y send-keys -X copy-pipe "reattach-to-user-namespace pbcopy"

# Update default binding of `Enter` to also use copy-pipe
#unbind -T copy-mode-vi Enter
#bind-key -T copy-mode-vi Enter send-keys -X copy-pipe "reattach-to-user-namespace pbcopy"

# Bind ']' to use pbpaste
# bind ] run "reattach-to-user-namespace pbpaste | tmux load-buffer - && tmux paste-buffer"

### End of copy/paste integration

# don't rename windows automatically
set-option -g allow-rename off

# toggle synchronize-panes with Prefix + C-x
bind C-x setw synchronize-panes

# make it obvious if the panes are synchronised
setw -g window-status-current-format '#{?pane_synchronized,#[bg=red],}#I:#W'
setw -g window-status-format         '#{?pane_synchronized,#[bg=red],}#I:#W'

# eof
TMUX
chown $SUDO_USER ~/.tmux.conf

su $SUDO_USER -c "mkdir ~/bin"

cat > ~/bin/tmux-mtc.sh <<'TMUXMTC'
#!/bin/zsh

# tmux script for mtc
chdir ~/MTC

tmux att -t mtc ||
tmux \
new -s 'mtc' -n 'admin' \; \
send-keys 'cd admin && nvm use' C-m \; \
neww -n 'pupil-spa' \; \
send-keys 'cd pupil-spa && nvm use' C-m \; \
neww -n 'pupil-api' \; \
send-keys 'cd pupil-api && nvm use' C-m \; \
neww -n 'func-consumption' \; \
send-keys 'cd func-consumption && nvm use' C-m \; \
neww -n 'functions-app' \; \
send-keys 'cd functions-app && nvm use' C-m \; \
neww -n 'tslib' \; \
send-keys 'cd tslib && nvm use' C-m \; \
neww -n 'e2e-tests' \; \
send-keys 'cd test/admin-hpa' C-m \; \
split-window -v \; \
send-keys 'cd test/pupil-hpa' C-m \; \
neww -n 'zsh1' \; \
send-keys 'nvm use' C-m \;
TMUXMTC
chown $SUDO_USER ~/bin/tmux-mtc.sh
chmod +x ~/bin/tmux-mtc.sh
