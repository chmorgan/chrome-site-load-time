# Based on:
# https://shoehornwithteeth.com/ramblings/2016/05/using-make-to-generate-chrome-extension-icons/

iconsrc := src/sigma.svg
icondir := src/icons
iconsizes := {16,19,38,48,128,256}
iconfiles := $(shell echo $(icondir)/icon-$(iconsizes).png)

$(icondir)/icon-%.png:
	@mkdir -p $(@D)
	convert -background none $(iconsrc) -resize $* $@

icons: $(iconfiles)

.PHONY: icons

clean:
	rm $(icondir)/icon-*.png
