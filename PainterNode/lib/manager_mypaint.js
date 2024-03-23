import { makeElement, rgbToHsv, getDataJSON } from "./helpers.js";

// Menu select brush in the menu
class MenuBrushes {
  constructor(managerMyPaint) {
    if (!managerMyPaint) {
      throw new Error("Class MyPaintManager not found!");
    }

    this.currentDir = "";
    this.managerMyPaint = managerMyPaint;

    // Slide dir variables
    this.pos = 0;
    this.currentSlide = 0;
    this.step = 150;
    this.listBrushes = managerMyPaint.brushesData;
    this.keysDir = Object.keys(this.listBrushes);
    //
    this.selectedBrushIndex = null;
    this.prevSelected = null;
    this.getAvailablesBrushes();
  }

  init() {
    this.createLayout();
    this.createDirList();
    this.createBrushList();
    this.bindEvents();
  }

  getAvailablesBrushes() {
    const availablesAll = this.keysDir
      .map((dir) => ({
        dir,
        count: this.listBrushes[dir].length,
      }))
      .filter((item) => item.count > 0);

    const availablesRoot = availablesAll.filter(
      (item) => item.dir === "brushes"
    );

    if (availablesRoot.length) {
      this.currentDir = availablesRoot[0].dir;
    } else {
      this.currentDir = availablesAll[0].dir;
      this.managerMyPaint.brushName =
        this.listBrushes[this.currentDir][0].filename;
    }
  }

  createLayout() {
    this.wrapper__kistey = makeElement("div", { class: ["wrapper__kistey"] });
    this.wrapper__kistey.style.display = "none";

    const box__kistey = makeElement("div", { class: ["box__kistey"] });

    const kistey__title = makeElement("div", { class: ["kistey__title"] });

    const kistey__left = makeElement("div", {
      class: ["kistey__arrow", "kistey__left"],
      textContent: "◀",
    });
    const kistey__right = makeElement("div", {
      class: ["kistey__arrow", "kistey__right"],
      textContent: "▶",
    });

    const kistey_dir__name_wrapper = makeElement("div", {
      class: ["kistey_dir__name_wrapper"],
    });
    const kistey_directory_slider = makeElement("div", {
      class: ["kistey_directory_slider"],
    });
    const kistey__body = makeElement("div", {
      class: ["kistey__body"],
      textContent: "Loading...",
    });

    kistey_dir__name_wrapper.append(kistey_directory_slider);
    kistey__title.append(kistey__left, kistey_dir__name_wrapper, kistey__right);
    box__kistey.append(kistey__title, kistey__body);

    this.wrapper__kistey.append(box__kistey);

    this.managerMyPaint.viewMenuBrushes.append(this.wrapper__kistey);
  }

  createDirList() {
    const kistey_directory_slider = this.wrapper__kistey.querySelector(
      ".kistey_directory_slider"
    );
    const kistey_dir__name_wrapper = this.wrapper__kistey.querySelector(
      ".kistey_dir__name_wrapper"
    );

    this.keysDir.forEach((dir, idx) => {
      const kistey_dir__name = document.createElement("div");
      kistey_dir__name.className = "kistey_dir__name";
      if (dir === this.currentDir) {
        this.currentSlide = idx;
        this.pos = -this.currentSlide * this.step;
        kistey_directory_slider.style.left = `${this.pos}px`;
        kistey_dir__name.classList.add("pop_active");
      }

      kistey_dir__name.textContent = dir;
      kistey_dir__name.title = dir[0].toUpperCase() + dir.slice(1);

      kistey_directory_slider.append(kistey_dir__name);
    });

    // Popup
    const kistey_directory_popup = kistey_directory_slider.cloneNode(true);
    kistey_directory_popup.style.left = "";
    kistey_directory_popup.className = "kistey_directory_popup";
    kistey_directory_popup.style.display = "none";
    Array.from(kistey_directory_popup.children).forEach((dir) =>
      dir.classList.add("kistey_dir__name-popup")
    );
    kistey_dir__name_wrapper.append(kistey_directory_popup);
  }

  createBrushList() {
    const kistey__body = this.wrapper__kistey.querySelector(".kistey__body");

    kistey__body.innerHTML = "";
    kistey__body.style.display = "grid";
    if (this.listBrushes[this.currentDir].length) {
      this.listBrushes[this.currentDir].forEach((brush, idx) => {
        const { filename, path } = brush;

        const kistey__item = makeElement("div", {
          class: ["kistey__item"],
          title: filename,
        });

        const kistey__img = makeElement("div", {
          class: ["kistey__img"],
        });

        const imageBrush = makeElement("img", {
          src: encodeURI(
            `${this.managerMyPaint.basePath}/brushes/${path}/${filename}_prev.png`
          ),
          alt: filename,
        });
        kistey__img.append(imageBrush);

        if (brush.filename === this.managerMyPaint.brushName) {
          imageBrush.classList.add("selected");
          this.prevSelected = imageBrush;
        }

        const brushName = makeElement("div", {
          class: ["kistey__name"],
          textContent: filename,
        });

        imageBrush.onerror = () => {
          imageBrush.src = `${this.managerMyPaint.basePath}/img/no_image.svg`;
        };

        kistey__item.append(kistey__img, brushName);
        kistey__body.append(kistey__item);
      });
    } else {
      kistey__body.style.display = "block";
      kistey__body.textContent = "No brush this directory...";
    }
  }

  setActiveDir() {
    const kistey_directory_popup = this.wrapper__kistey.querySelector(
      ".kistey_directory_popup"
    );
    const kistey_directory_slider = this.wrapper__kistey.querySelector(
      ".kistey_directory_slider"
    );

    Array.from(kistey_directory_slider.children).forEach((dir, idx) =>
      this.currentSlide === idx
        ? dir.classList.add("pop_active")
        : dir.classList.remove("pop_active")
    );

    Array.from(kistey_directory_popup.children).forEach((dir, idx) =>
      this.currentSlide === idx
        ? dir.classList.add("pop_active")
        : dir.classList.remove("pop_active")
    );
  }

  moveSlide(target) {
    const kistey_directory_popup = this.wrapper__kistey.querySelector(
      ".kistey_directory_popup"
    );
    const kistey_directory_slider = this.wrapper__kistey.querySelector(
      ".kistey_directory_slider"
    );

    kistey_directory_popup.style.display = "none";

    const len = this.keysDir.length - 1;

    if (target) {
      if (target.classList.contains("kistey__left")) {
        this.currentSlide -= 1;
        if (this.currentSlide < 0) {
          this.pos = -len * this.step;
          this.currentSlide = len;
        }
      } else {
        this.currentSlide += 1;
        if (this.currentSlide > len) this.pos = this.currentSlide = 0;
      }
    }

    this.pos = -this.currentSlide * this.step;
    kistey_directory_slider.style.left = `${this.pos}px`;
    this.currentDir = this.keysDir[this.currentSlide];
    this.createBrushList();
  }

  bindEvents() {
    const kistey_directory_popup = this.wrapper__kistey.querySelector(
      ".kistey_directory_popup"
    );
    const kistey__body = this.wrapper__kistey.querySelector(".kistey__body");

    this.wrapper__kistey
      .querySelector(".box__kistey")
      .addEventListener("click", (e) => {
        let target = e.target;

        while (target !== e.currentTarget) {
          if (
            target.classList.contains("kistey__body") &&
            kistey_directory_popup.style.display === "flex"
          ) {
            kistey_directory_popup.style.display = "none";
          }

          // Items
          if (target.classList.contains("kistey__item")) {
            const idx_item = Array.from(kistey__body.children).findIndex(
              (item) => target === item
            );
            // console.log(
            //   "Selected:",
            //   this.currentDir,
            //   this.listBrushes[this.currentDir][idx_item]
            // );

            this.managerMyPaint.setBrush(
              this.listBrushes[this.currentDir][idx_item]
            );

            if (this.prevSelected !== target.children[0].children[0]) {
              if (this.prevSelected)
                this.prevSelected.classList.remove("selected");
              target.children[0].children[0].classList.add("selected");
              this.prevSelected = target.children[0].children[0];
            }
          }

          // Arrows slide
          if (target.classList.contains("kistey__arrow")) {
            this.moveSlide(target);
          }

          // Popup
          if (target.classList.contains("kistey_directory_slider")) {
            this.setActiveDir();
            kistey_directory_popup.style.display =
              kistey_directory_popup.style.display === "none" ? "flex" : "none";
          }

          if (target.classList.contains("kistey_dir__name-popup")) {
            const index = Array.from(target.parentElement.children).findIndex(
              (el) => el === target
            );
            if (this.currentDir === index) return;
            this.currentDir = this.keysDir[index];
            this.currentSlide = index;
            this.moveSlide();
            this.setActiveDir();
          }

          target = target.parentNode;
        }
      });
  }
}

// Manager MyPaint
class MyPaintManager {
  constructor(painterNode, brushName = "charcoal") {
    if (!painterNode) return new Error("Link to PainterNode not exist!");

    this.painterNode = painterNode;

    this.basePath =
      "extensions/ComfyUI_Custom_Nodes_AlekPet/assets/painternode";
    this.brushName = brushName;
    this.currentBrushSettings = null;
  }

  async createElements() {
    // Wrapper from brushes menu and settings
    this.viewMenuBrushes = makeElement("div", {
      class: ["viewMenuBrushes"],
    });

    // Open menu brushes
    this.boxButtonsBrushes = makeElement("div", {
      class: ["boxButtonsBrushes"],
    });

    const buttonMenuBrushes = makeElement("button", {
      class: ["buttonMenuBrushes"],
      textContent: "Brushes",
    });
    buttonMenuBrushes.customSize = { w: 60, h: 25, fs: 10 };

    buttonMenuBrushes.addEventListener("click", () => {
      if (!this.menuBrushes.wrapper__kistey) {
        this.menuBrushes.init();
      }

      this.menuBrushes.wrapper__kistey.style.display =
        this.menuBrushes.wrapper__kistey.style.display === "none"
          ? "block"
          : "none";
    });

    // Settings brushes
    const buttonMenuSettings = makeElement("button", {
      class: ["buttonMenuSettings"],
      textContent: "Settings",
    });
    buttonMenuSettings.customSize = { w: 60, h: 25, fs: 10 };

    buttonMenuSettings.addEventListener("click", () => {
      this.kistey_wrapper_settings.style.display =
        this.kistey_wrapper_settings.style.display === "none"
          ? "block"
          : "none";
    });

    this.boxButtonsBrushes.append(
      buttonMenuBrushes,
      buttonMenuSettings,
      this.viewMenuBrushes
    );

    // Create menu settings
    this.createMenuSettings();

    // Select brush items
    this.brushesData = await getDataJSON(
      `${this.basePath}/json/brushes_data.json`
    );
    this.menuBrushes = new MenuBrushes(this);

    await this.loadBrushSetting(
      this.menuBrushes.currentDir === "brushes"
        ? "/"
        : this.menuBrushes.currentDir,
      this.brushName
    );
  }

  createMenuSettings() {
    this.kistey_wrapper_settings = makeElement("div", {
      class: ["kistey_wrapper_settings"],
      style: "display: none;",
    });
    const box__kistey_settings = makeElement("div", {
      class: ["box__kistey_settings"],
    });
    const kistey_settings_body = makeElement("div", {
      class: ["kistey_settings_body"],
    });
    const titleSettings = makeElement("div", {
      class: ["titleSettings"],
      textContent: "Settings",
    });

    box__kistey_settings.append(titleSettings, kistey_settings_body);
    this.kistey_wrapper_settings.append(box__kistey_settings);

    // Range events
    const rangeInputEvent = (e) => {
      e.currentTarget.nextSibling.textContent = (+e.currentTarget
        .value).toFixed(2);
      const valueRange =
        ((e.currentTarget.value - e.currentTarget.min) /
          (e.currentTarget.max - e.currentTarget.min)) *
        100;
      e.currentTarget.style.background =
        "linear-gradient(to right, #15539e 0%, #15539e " +
        valueRange +
        "%, #282828 " +
        valueRange +
        "%, #282828 100%)";
    };

    const settings = [
      // { name: "size", max: 1.0, min: 0, step: 0.01, value: 0.75, type: "range", title:"" , events: {input: rangeInputEvent}},
      // { name: "opaque", max: 1.0, min: 0, step: 0.01, value: 0.75, type: "range", title:"" , events: {input: rangeInputEvent}},
      // { name: "sharp", max: 1.0, min: 0, step: 0.01, value: 0.75, type: "range", title:"" , events: {input: rangeInputEvent}},
      // { name: "gain", max: 1.0, min: 0, step: 0.01, value: 0.75, type: "range", title:"" , events: {input: rangeInputEvent}},
      // { name: "pigment", max: 1.0, min: 0, step: 0.01, value: 0.75, type: "range", title:"" , events: {input: rangeInputEvent}},
      // { name: "smooth", max: 1.0, min: 0, step: 0.01, value: 0.75, type: "range", title:"" , events: {input: rangeInputEvent}},
      {
        name: "pressure",
        max: 1.0,
        min: 0,
        step: 0.01,
        value: 0.75,
        type: "range",
        title: "Pressure (Mouse pressure)",
        events: { input: rangeInputEvent },
      },
      // { name: "twist", max: 1.0, min: 0, step: 0.01, value: 0.75, type: "range", title:"" , events: {input: rangeInputEvent}},
      {
        name: "default size",
        checked:
          window.LS_Painters[this.painterNode.node.name].settings
            ?.mypaint_settings?.preset_brush_size ?? true,
        type: "checkbox",
        title: "Apply size from brush settings",
        events: {
          change: (e) => {
            const lsPainter =
              window.LS_Painters[this.painterNode.node.name].settings;
            if (!lsPainter.hasOwnProperty("mypaint_settings"))
              window.LS_Painters[
                this.painterNode.node.name
              ].settings.mypaint_settings = {};

            window.LS_Painters[
              this.painterNode.node.name
            ].settings.mypaint_settings.preset_brush_size =
              this.CheckboxDefSize.checked;

            // Save to localStorage
            localStorage.setItem(
              "ComfyUI_Painter",
              JSON.stringify(window.LS_Painters)
            );
          },
        },
      },
    ];
    settings.forEach((setting, idx) => {
      let element, elementValue;

      const { name, value, type, title } = setting;
      const namedClass = name.includes(" ") ? name.replace(/\W|\s/g, "") : name;
      const boxElement = makeElement("div", {
        class: ["kistey_setting__item"],
      });

      if (type === "range") {
        const { min, max, step } = setting;
        const range = makeElement("input", {
          max,
          min,
          step,
          value,
          title,
          type,
          class: [`input_range_${namedClass}`],
        });

        const valueRange =
          ((range.value - range.min) / (range.max - range.min)) * 100;

        range.customSize = { w: 100, h: 6, fs: 10 };
        range.style.background =
          "linear-gradient(to right, #15539e 0%, #15539e " +
          valueRange +
          "%, #282828 " +
          valueRange +
          "%, #282828 100%)";

        if (setting?.events && Object.keys(setting.events).length) {
          Object.keys(setting.events).forEach((eventName) =>
            range.addEventListener(eventName, setting.events[eventName])
          );
        }

        element = range;
        elementValue = makeElement("span", { textContent: element.value });
      } else if (type === "checkbox") {
        const { checked } = setting;
        const checkbox = makeElement("input", {
          type,
          title,
          checked,
          class: [`checkbox_${namedClass}`],
        });

        checkbox.customSize = { w: 15, h: 15, fs: 10 };

        if (setting?.events && Object.keys(setting.events).length) {
          Object.keys(setting.events).forEach((eventName) =>
            checkbox.addEventListener(eventName, setting.events[eventName])
          );
        }

        element = checkbox;
        elementValue = makeElement("span", { textContent: element.checked });
      }

      // Append element
      const textNode = makeElement("span", {
        textContent: name[0].toUpperCase() + name.slice(1),
      });

      boxElement.append(textNode, element, elementValue);
      kistey_settings_body.append(boxElement);
    });

    // Mouse Pressure
    this.mousepressure = this.kistey_wrapper_settings.querySelector(
      ".input_range_pressure"
    );

    // Load size for settings brush
    this.CheckboxDefSize = this.kistey_wrapper_settings.querySelector(
      ".checkbox_defaultsize"
    );

    this.viewMenuBrushes.append(this.kistey_wrapper_settings);
  }

  appendElements(parent) {
    const separator = makeElement("div", { class: ["separator"] });

    parent.append(separator, this.boxButtonsBrushes);

    this.setPropertyBrush();
  }

  async loadBrushSetting(pathToBrush, brushName) {
    pathToBrush = `brushes/${pathToBrush}/`;

    const pathToJsonBrush = encodeURI(
      `${this.basePath}/${pathToBrush}${brushName}`
    );

    this.currentBrushSettings = await getDataJSON(
      `${pathToJsonBrush}.myb.json`
    );
    this.currentBrushImg = `${pathToJsonBrush}.png`;
  }

  setColorBrush(colorvalue) {
    const source = new fabric.Color(colorvalue);
    const [r, g, b] = source._source;
    const [h, s, v] = rgbToHsv(r, g, b);
    const bs = this.currentBrushSettings;
    bs.color_h.base_value = h;
    bs.color_s.base_value = s;
    bs.color_v.base_value = v;

    this.painterNode.canvas.freeDrawingBrush.brush.readmyb_json(bs);
  }

  setSizeBrush(sizevalue) {
    this.currentBrushSettings.radius_logarithmic.base_value =
      parseFloat(sizevalue);
    this.painterNode.canvas.freeDrawingBrush.brush.readmyb_json(
      this.currentBrushSettings
    );
  }

  setPropertyBrush() {
    // Set brush property: color, width
    this.painterNode.strokeWidth.max = 7;
    this.painterNode.strokeWidth.min = 0.2;
    this.painterNode.strokeWidth.step = 0.01;

    if (this.CheckboxDefSize.checked)
      this.painterNode.strokeWidth.value =
        this.currentBrushSettings.radius_logarithmic.base_value;

    this.painterNode.changePropertyBrush(this.painterNode.type);
  }

  async setBrush(data) {
    const { filename: brushName, path: pathToBrush } = data;

    if (brushName === "separator") return;

    if (pathToBrush === null || pathToBrush === undefined) {
      return new Error("No exist path in dataset!");
    }

    this.brushName = brushName;
    await this.loadBrushSetting(pathToBrush, brushName);

    this.painterNode.canvas.freeDrawingBrush.brush = new MypaintBrush(
      this.currentBrushSettings,
      this.painterNode.canvas.freeDrawingBrush.surface
    );
    this.setPropertyBrush();
  }
}

export { MyPaintManager };