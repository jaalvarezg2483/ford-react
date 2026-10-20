# Require any additional compass plugins here.

# Set this to the root of your project when deployed:
http_path = "/"
css_dir = "assets/css"
sass_dir = "sass"
javascripts_dir = "assets/js"

# You can select your preferred output style here (can be overridden via the command line):
output_style = :compressed

# To enable relative paths to assets via compass helper functions. Uncomment:
# relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
line_comments = false


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass
relative_assets       = true

# Include ruby lib for local extension testing
module Sass::Script::Functions

  def list_separator(list)
    if list.class == Sass::Script::List or list.class == Sass::Script::ArgList
      Sass::Script::String.new(list.separator.to_s)
    else
      Sass::Script::String.new('space')
    end
  end
  declare :separator, [:list]

end
