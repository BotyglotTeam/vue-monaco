import assign from 'nano-assign';

var MonacoEditor = {
  name: 'MonacoEditor',
  props: {
    original: String,
    value: {
      type: String,
      required: true
    },
    theme: {
      type: String,
      "default": 'vs'
    },
    language: String,
    options: Object,
    amdRequire: {
      type: Function
    },
    diffEditor: {
      type: Boolean,
      "default": false
    }
  },
  model: {
    event: 'change'
  },
  watch: {
    options: {
      deep: true,
      handler: function handler(options) {
        if (this.editor) {
          var editor = this.getModifiedEditor();
          editor.updateOptions(options);
        }
      }
    },
    value: function value(newValue) {
      if (this.editor) {
        var editor = this.getModifiedEditor();

        if (newValue !== editor.getValue()) {
          editor.setValue(newValue);
        }
      }
    },
    original: function original(newValue) {
      if (this.editor && this.diffEditor) {
        var editor = this.getOriginalEditor();

        if (newValue !== editor.getValue()) {
          editor.setValue(newValue);
        }
      }
    },
    language: function language(newVal) {
      if (this.editor) {
        var editor = this.getModifiedEditor();
        this.monaco.editor.setModelLanguage(editor.getModel(), newVal);
      }
    },
    theme: function theme(newVal) {
      if (this.editor) {
        this.monaco.editor.setTheme(newVal);
      }
    }
  },
  mounted: function mounted() {
    var _this = this;

    if (this.amdRequire) {
      this.amdRequire(['vs/editor/editor.main'], function () {
        _this.monaco = window.monaco;

        _this.$nextTick(function () {
          _this.initMonaco(window.monaco);
        });
      });
    } else {
      import('monaco-editor').then(function (monaco) {
        _this.monaco = monaco;

        _this.$nextTick(function () {
          _this.initMonaco(monaco);
        });
      });
    }
  },
  beforeDestroy: function beforeDestroy() {
    this.editor && this.editor.dispose();
  },
  methods: {
    initMonaco: function initMonaco(monaco) {
      var _this2 = this;

      this.$emit('editorWillMount', this.monaco);
      var options = assign({
        value: this.value,
        theme: this.theme,
        language: this.language
      }, this.options);

      if (this.diffEditor) {
        this.editor = monaco.editor.createDiffEditor(this.$el, options);
        var originalModel = monaco.editor.createModel(this.original, this.language);
        var modifiedModel = monaco.editor.createModel(this.value, this.language);
        this.editor.setModel({
          original: originalModel,
          modified: modifiedModel
        });
      } else {
        this.editor = monaco.editor.create(this.$el, options);
      } // @event `change`


      var editor = this.getModifiedEditor();
      editor.onDidChangeModelContent(function (event) {
        var value = editor.getValue();

        if (_this2.value !== value) {
          _this2.$emit('change', value, event);
        }
      });
      this.$emit('editorDidMount', this.editor);
    },

    /** @deprecated */
    getMonaco: function getMonaco() {
      return this.editor;
    },
    getEditor: function getEditor() {
      return this.editor;
    },
    getModifiedEditor: function getModifiedEditor() {
      return this.diffEditor ? this.editor.getModifiedEditor() : this.editor;
    },
    getOriginalEditor: function getOriginalEditor() {
      return this.diffEditor ? this.editor.getOriginalEditor() : this.editor;
    },
    focus: function focus() {
      this.editor.focus();
    }
  },
  render: function render(h) {
    return h('div');
  }
};

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.component(MonacoEditor.name, MonacoEditor);
}

export default MonacoEditor;
