function addOptions(options) {
    // 获取select元素
    var select = document.getElementById("mySelect");

    // 遍历传入的选项数组
    options.forEach(function(option) {
        // 创建一个新的option元素
        var newOption = document.createElement("option");

        // 设置option的值和显示文本
        newOption.value = option.value;
        newOption.text = option.text;

        // 将新option添加到select元素中
        select.add(newOption);
    });
}

// 示例：添加多个选项
var options = [
    { value: "option1", text: "Option 1" },
    { value: "option2", text: "Option 2" },
    { value: "option3", text: "Option 3" }
];