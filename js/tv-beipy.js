function isValidURL(url) {
  const pattern = /^(https?:\/\/)?(www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/[^\s]*)?$/;
  return pattern.test(url);
}
//play点击事件
function play() {
	var rul = document.getElementById("url").value; //获取input链接
	if(rul == "") {
		//用于测试
		rul = "https://www.iqiyi.com/v_1a0si8sf4fc.html"
	} 

	if(rul == "") {
		alert("请输入链接")
	} else {
		var jxApi = document.getElementById("jk"); //获取选择按钮
		var jxurl = document.getElementById("jk").selectedIndex; //获取选中的
		if(!isValidURL(rul)){
			//如果输入的不是网址，则执行搜索名称
			jkv = "https://z1.m1907.top/?jx=";
			console.log("搜索影片");
		}else{
			jkv = jxApi.options[jxurl].value; //获取选择接口链接
		}
		
		var paly = document.getElementById("palybox"); //获取播放窗口位置
		paly.src = jkv + rul; //接口赋值

		//ajax数据传递

		var tittext = document.getElementById("tittext");
		//1,create ajax核心对象：
		var xhr = getxhr();
		//2,以post的方式与服务器建立连接；
		xhr.open("post", "data/title.php", true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		//3,发送一个http请求:
		xhr.send("titurl=" + rul);
		console.log(xhr.readyState);
		//获取服务器状态码
		xhr.onreadystatechange = function() {
			console.log(xhr.readyState)
			console.log(xhr.status)
			if(xhr.readyState == 4 && xhr.status == 200) {
				tittext.innerHTML = xhr.responseText; //获取服务器响应数据
			}
		}

		function getxhr() {
			var xhr = null;
			if(window.XMLHttpRequest) {
				xhr = new XMLHttpRequest();
			} else {
				xhr = new ActiveXObject("Microsoft.XMLHttp");
			}
			return xhr;
		}
	}
}


// 添加到收藏夹功能
function addToFavorite() {
	var url = window.location.href;
	var title = document.title;
	
	try {
		if (window.sidebar && window.sidebar.addPanel) {
			// Firefox
			window.sidebar.addPanel(title, url, "");
		} else if (window.opera && window.print) {
			// Opera
			var elem = document.createElement('a');
			elem.setAttribute('href', url);
			elem.setAttribute('title', title);
			elem.setAttribute('rel', 'sidebar');
			elem.click();
		} else if (document.all) {
			// IE系列
			window.external.AddFavorite(url, title);
		} else if (window.chrome) {
			// Chrome
			alert('按Ctrl+D将本页添加到收藏夹');
		}
		/*
		document.getElementById('add-to-favorite').innerHTML = '<span class="icon">✓</span> 已添加收藏';
		document.getElementById('add-to-favorite').disabled = true;
		document.getElementById('add-to-favorite').classList.add('added');
		*/
		
	} catch (e) {
		displayToast('添加收藏失败，请手动收藏本页面', 'error');
	}
}

// 显示Toast提示
function displayToast(message, type = 'info') {
	// 检查是否已存在toast元素，如果有则移除
	var existingToast = document.getElementById('custom-toast');
	if (existingToast) {
		existingToast.remove();
	}
	
	// 创建新的toast元素
	var toast = document.createElement('div');
	toast.id = 'custom-toast';
	toast.className = 'toast toast-' + type;
	toast.textContent = message;
	
	// 添加到body
	document.body.appendChild(toast);
	
	// 设置初始样式
	setTimeout(function() {
		toast.classList.add('show');
	}, 10);
	
	// 3秒后自动消失
	setTimeout(function() {
		toast.classList.remove('show');
		setTimeout(function() {
			if (document.body.contains(toast)) {
				document.body.removeChild(toast);
			}
		}, 300);
	}, 3000);
}
		

		
	
		

		

		
	
